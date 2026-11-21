/* Demo-only answer key: loaded ONLY in demo/standalone mode so event rounds never
   ship answers to the browser. server/scripts/build-keys.js reads this file too.
   Every denomination has 3 genuine entries (15 genuine + 14 fake = 29 sets) so
   seeing a genuine note never implies the next note of that denomination is fake. */
window.FAKECASH_DEMO_ANSWERS = [
  true,  false, false, false, false, false, true,  true,  // RM50 (0..7: 3 genuine, 5 fake)
  true,  true,  true,  false, false, false,               // RM100 (8..13: 3 genuine, 3 fake)
  true,  true,  true,  false, false,                      // RM20 (14..18: 3 genuine, 2 fake)
  true,  true,  true,  false, false,                      // RM10 (19..23: 3 genuine, 2 fake)
  true,  true,  true,  false, false                       // RM5 (24..28: 3 genuine, 2 fake)
];
