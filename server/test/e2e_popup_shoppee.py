#!/usr/bin/env python3
"""ShopPee regressions against the real server, isolated from event data."""
import os
import subprocess
import tempfile
import unittest
from pathlib import Path
from urllib.parse import quote

from playwright.sync_api import sync_playwright
import e2e_participant as api

ROOT = Path(__file__).resolve().parents[2]
BASE = api.BASE = 'http://127.0.0.1:3066'
BROWSE = BASE + '/games/close-the-popups/browse/'


class ShopPeeTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.data = tempfile.TemporaryDirectory(prefix='shoppee-regression-')
        cls.server = subprocess.Popen(['node', 'server.js'], cwd=ROOT / 'server',
            env=dict(os.environ, PORT='3066', DATA_DIR=cls.data.name,
                     ADMIN_PIN='9999', STAFF_PIN='1111', STATION_PINS='2:5002'),
            stdout=subprocess.DEVNULL)
        api.wait_server()
        cls.pw = sync_playwright().start()
        cls.browser = cls.pw.chromium.launch(channel='chrome',
            ignore_default_args=['--disable-back-forward-cache'])

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.pw.stop()
        cls.server.terminate()
        cls.server.wait(timeout=5)
        cls.data.cleanup()

    def setUp(self):
        self.context = self.browser.new_context(viewport={'width':1440, 'height':900}, reduced_motion='reduce')
        self.page = self.context.new_page()
        self.errors = []
        self.page.on('pageerror', lambda error: self.errors.append(str(error)))

    def tearDown(self):
        self.context.close()
        self.assertEqual(self.errors, [])

    def start(self, pid='pmax', lang='en'):
        p = self.page
        p.goto(BROWSE + 'booth.html?lang=' + lang)
        self.record = p.evaluate("""lang => {
            const r = BROWSE_BOOTH.create('minute4-shoppee-buy', 'clean', lang);
            return {id:r.id, seed:r.seed, url:BROWSE_BOOTH.entryURL(r)};
        }""", lang)
        p.goto(self.record['url'] + '&id=' + pid)
        p.locator('#buyNowBtn').wait_for()

    def payment(self):
        for selector in ['#buyNowBtn', '#mNext', '#mNext']:
            self.page.locator(selector).click()

    def offer(self):
        return self.page.evaluate("""() => BROWSE_BOOTH_ADS('shoppee','en',{
            root:document.querySelector('#site-root'), read:() => null
        }).site(1)""")

    def test_checkout_keyboard_focus_and_escape(self):
        self.start()
        self.payment()
        self.assertTrue(self.page.locator('#placeOrder').evaluate('e => e === document.activeElement'))
        self.page.keyboard.press('Escape')
        self.assertFalse(self.page.locator('#buyModal').evaluate("e => e.classList.contains('show')"))

    def test_saved_indicator_survives_reload(self):
        self.start()
        self.page.locator('.g-actions .g-btn').first.click()
        self.page.reload()
        self.assertIn('Saved', self.page.locator('.g-actions .g-btn').first.inner_text())
        self.page.locator('.g-actions .g-btn').first.click()
        self.page.reload()
        self.assertNotIn('Saved', self.page.locator('.g-actions .g-btn').first.inner_text())

    def test_chinese_search_uses_displayed_product_names(self):
        self.page.goto(BROWSE + 'shoppee.html?lang=zh&view=mobile&q=' + quote('仓库'))
        self.assertEqual(self.page.locator('.p-grid.list .p-card:visible').count(), 1)
        self.assertIn('仓库', self.page.locator('.p-grid.list .p-card:visible').inner_text())

    def test_invalid_product_ids_do_not_break_round(self):
        for pid in ['__proto__', 'constructor', 'toString', 'missing']:
            with self.subTest(pid=pid):
                self.start(pid)
                self.assertIn('iPhone 18 Pro Max', self.page.locator('#prodTitle').inner_text())
                self.assertEqual(self.page.locator('[data-booth-submit]').count(), 1)

    def test_payment_ad_follows_current_document_after_native_back(self):
        self.start()
        self.payment()
        self.assertEqual(self.offer(), 'security')
        self.page.evaluate("window.addEventListener('pageshow',e => window.wasCached = e.persisted)")
        self.page.goto(self.page.url.replace('id=pmax', 'id=18pro'))
        self.assertEqual(self.offer(), 'desk')
        self.page.go_back(wait_until='commit')
        self.page.locator('#buyModal.show').wait_for()
        self.assertTrue(self.page.evaluate('window.wasCached'), 'must exercise real BFCache')
        self.assertEqual(self.offer(), 'security')
        self.page.locator('#mClose').click()
        self.assertEqual(self.offer(), 'desk')

    def test_new_variant_starts_checkout_instead_of_showing_old_receipt(self):
        self.start()
        self.payment()
        self.page.locator('#placeOrder').click()
        self.page.locator('#mClose').click()
        self.page.locator('[data-variant="storage"] [data-value="2TB"]').click()
        self.page.locator('#buyNowBtn').click()
        self.assertTrue(self.page.locator('#mstep1').is_visible())
        self.assertFalse(self.page.locator('#mstep4').is_visible())
        self.assertIn('2TB', self.page.locator('#sumVar').inner_text())

    def test_scam_checkout_can_be_closed_and_retried(self):
        self.start('pmax-outlet')
        self.payment()
        self.page.locator('#placeOrder').click()
        self.page.locator('.sp-warning').wait_for()
        self.page.locator('#mClose').click()
        self.payment()
        self.assertTrue(self.page.locator('#placeOrder').is_visible())
        self.page.locator('#placeOrder').click()
        self.assertFalse(self.page.evaluate('(id) => BROWSE_BOOTH.assess(BROWSE_BOOTH.get(id)).allMet', self.record['id']))

    def test_selected_colour_updates_price_description(self):
        self.start()
        self.page.locator('[data-variant="storage"] [data-value="512GB"]').click()
        self.page.locator('[data-variant="color"] [data-value="Black"]').click()
        self.assertIn('Black', self.page.locator('#rangeNote').inner_text())
        self.assertNotIn('Glacier', self.page.locator('#rangeNote').inner_text())


if __name__ == '__main__':
    unittest.main(verbosity=2)
