/* ============================================================
   CFA seasonal effects: YOUR CONTROLS
   Change a value, upload this ONE file to GitHub, and it is live in about a minute.

   enabled        true  = effects run automatically by date (default)
                  false = ALL effects off for everyone (the master switch)

   force          null  = automatic by date (default)
                  or one of: "winter" "autumn" "halloween" "spring" "summer"
                  to show that theme all the time

   visitorSwitch  true  = show the small "Snow: on/off" button for visitors
                  false = hide the button

   offPages       pages that never get effects (forms, prices, legal)

   Calendar (automatic):
     1 Sep - 23 Oct   autumn      24 - 31 Oct     halloween     1 - 18 Nov   autumn
     19 Nov - 20 Jan  winter      21 Jan - 28 Feb none
     1 Mar - 30 Apr   spring      1 - 24 May      none
     25 May - 31 Aug  summer

   Quick preview without changing anything: add ?effects=winter (or autumn,
   halloween, spring, summer) to any page address. Use ?effects=off to see it plain.
   ============================================================ */
window.CFA_EFFECTS = {
  enabled: true,
  force: null,
  visitorSwitch: true,
  offPages: ['/privacy', '/pricing', '/contact', '/take-home-pay-calculator', '/salary-vs-dividend-calculator', '/budget-planner']
};
