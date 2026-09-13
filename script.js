(() => { /* Immediately Invoked Function Expression (IIFE): this function runs right away when the script loads. Wrapping everything in an IIFE keeps our variables out of the global scope so they don't clash with other scripts. */
  "use strict"; /* Enables JavaScript's strict mode, which catches common coding mistakes and prevents silent errors */

  // ============ DATA ============ /* Section: Static data used by the app (the list of date types and food choices) */
  const DATE_TYPES = [ /* An array of date activity options shown in the date-type step. Each object has an emoji and a label. */
    { emoji: "🌅", label: "Sunset Picnic" }, /* First date option: a sunset picnic with a sunrise emoji */
    { emoji: "🎬", label: "Movie Night" }, /* Second date option: a movie night with a film emoji */
    { emoji: "🦋", label: "Stargazing Walk" }, /* Third date option: a stargazing walk with a butterfly emoji */
    { emoji: "☕", label: "Coffee Date" }, /* Fourth date option: a coffee date with a coffee cup emoji */
    { emoji: "🎡", label: "Park Rides" }, /* Fifth date option: a theme park ride with a ferris wheel emoji */
    { emoji: "🏖️", label: "Swimming" } /* Sixth date option: a beach day with a beach emoji */
  ];

  const FOOD_TYPES = [ /* An array of food options shown in the food step. Each object has an emoji and a label. */
    { emoji: "🍕", label: "Pizza" }, /* First food option: pizza with a pizza slice emoji */
    { emoji: "🍣", label: "Sushi" }, /* Second food option: sushi with a sushi emoji */
    { emoji: "🍜", label: "Ramen" }, /* Third food option: ramen with a noodle bowl emoji */
    { emoji: "🍔", label: "Burgers" }, /* Fourth food option: burgers with a hamburger emoji */
    { emoji: "🍰", label: "Dessert" }, /* Fifth food option: dessert with a cake emoji */
    { emoji: "🙋‍♂️", label: "Ako?" } /* Sixth food option: ice cream with an ice cream emoji */
  ];

  // ============ DOM REFS ============ /* Section: Grabbing references to important HTML elements so we can manipulate them later */
  const $ = (sel) => document.querySelector(sel); /* A shorthand helper function. $("selector") is the same as document.querySelector("selector") — it finds the first HTML element matching the CSS selector and returns it. */
  const stepLanding = $("#step-landing"); /* Grabs the Step 1 (landing) section element by its id */
  const stepDate = $("#step-date"); /* Grabs the Step 2 (pick date type) section element */
  const stepCalendar = $("#step-calendar"); /* Grabs the Step 3 (pick calendar day) section element */
  const stepTime = $("#step-time"); /* Grabs the Step 4 (pick time) section element */
  const stepFood = $("#step-food"); /* Grabs the Step 5 (pick food) section element */
  const stepResult = $("#step-result"); /* Grabs the Step 6 (result) section element */
  const btnYes = $("#btn-yes"); /* Grabs the "Yes, I'd love to!" button */
  const btnNo = $("#btn-no"); /* Grabs the "No" button (the one that dodges away) */
  const dateOptions = $("#date-options"); /* Grabs the empty container where date option buttons will be inserted */
  const foodOptions = $("#food-options"); /* Grabs the empty container where food option buttons will be inserted */
  const btnDateNext = $("#date-next"); /* Grabs the "Continue" button on the date type step */
  const datePicker = $("#date-picker"); /* Grabs the native HTML calendar date input */
  const btnCalNext = $("#cal-next"); /* Grabs the "Continue" button on the calendar day step */
  const timePicker = $("#time-picker"); /* Grabs the native HTML time input */
  const btnTimeBack = $("#time-back"); /* Grabs the "Back" button on the time step */
  const btnTimeNext = $("#time-next"); /* Grabs the "Continue" button on the time step */
  const btnFoodNext = $("#food-next"); /* Grabs the "Confirm" button on the food step */
  const btnFoodBack = $("#food-back"); /* Grabs the "Back" button on the food step */
  const btnSavePlan = $("#save-plan"); /* Grabs the "Save my plan" button on the result page */
  const btnRestart = $("#restart"); /* Grabs the "Start over" button on the result step */

  let pickedDate = null; /* Holds the label of the date type the user selected (starts as null because nothing is picked yet) */
  let pickedDay = null; /* Holds the calendar day string the user selected (starts as null) */
  let pickedTime = null; /* Holds the time string the user selected (starts as null) */
  let pickedFood = null; /* Holds the label of the food the user selected (starts as null because nothing is picked yet) */
  let growLevel = 0; /* Tracks how much the "Yes" button has grown. It starts at 0 and increases by 0.15 each time the "No" button is pressed. */
  let noCount = 0; /* Counts how many times the user has tried to press the "No" button (used to cycle through sad messages) */
  let noOnBody = false; /* A flag (true/false) that tells us whether the "No" button has been moved to the <body> element or not */
  const noOriginalParent = btnNo.parentNode; /* Saves a reference to the original parent element of the "No" button, so we can put it back on restart */
  const noOriginalNext = btnNo.nextSibling; /* Saves a reference to the next neighbor of the "No" button, so we can restore its exact original position */
  const noMessage = $("#no-message"); /* Grabs the paragraph where sad messages appear when the user presses "No" */

  // ============ AUTO-FORGING CACHE (REMEMBER + ASSET CACHE) ============ /* Section: Saves the user's selections in the browser (localStorage) and preloads/caches the GIFs so they load instantly */
  const CACHE_KEY = "willYouBeMyDate"; /* A single key string used to store the whole user state object in the browser's localStorage */

  function cacheGifs() { /* Defines a function that preloads all the GIF files into the browser's memory/cache so they appear instantly */
    const gifs = [ /* An array of the GIF image paths used across the app */
      "gif/dudu-flow-kiss-cute-dudu.gif", /* The kiss GIF for the date/time steps */
      "gif/cuddle-cute.gif", /* The hug GIF for the success page */
      "gif/sad-cry.gif", /* The crying GIF for the "No" button messages */
      "gif/bubu-dudu.gif" /* The extra cute GIF */
    ];
    gifs.forEach((src) => { /* Loops through every GIF path */
      const img = new Image(); /* Creates a new in-memory Image object (this triggers the browser to load/cache the file) */
      img.src = src; /* Sets the source, which makes the browser download and cache the GIF for instant later use */
    });
  }
  cacheGifs(); /* Immediately calls cacheGifs when the script loads so all GIFs are cached up front */

  function saveState() { /* Defines a function that writes the current selections into localStorage so they survive a page refresh */
    const state = { /* Builds a plain object containing all the current picks */
      date: pickedDate, /* The chosen date-type label */
      day: pickedDay, /* The chosen calendar day string */
      time: pickedTime, /* The chosen time string */
      food: pickedFood /* The chosen food label */
    };
    try { /* Wraps in try/catch because localStorage can throw when it's disabled or full */
      localStorage.setItem(CACHE_KEY, JSON.stringify(state)); /* Converts the state object to a string and stores it under the cache key */
    } catch (err) { /* If saving fails (e.g. incognito mode with storage disabled): */
      /* silently ignore — the app still works, it just won't remember between refreshes */
    }
  }

  function restoreState() { /* Defines a function that reads the previously saved selections back from localStorage when the page loads */
    let state = null; /* Will hold the restored object if one exists */
    try { /* Wraps in try/catch because localStorage can throw here too */
      state = JSON.parse(localStorage.getItem(CACHE_KEY)); /* Reads the stored JSON string and parses it back into an object */
    } catch (err) { /* If parsing fails or the key is missing: */
      state = null; /* Keep state as null (nothing to restore) */
    }
    if (!state || !state.date && !state.day && !state.time && !state.food) return; /* If there's no saved data at all, do nothing (stay on the landing page) */

    pickedDate = state.date || null; /* Restore the saved date-type label (or null if it was never set) */
    pickedDay = state.day || null; /* Restore the saved calendar day (or null) */
    pickedTime = state.time || null; /* Restore the saved time (or null) */
    pickedFood = state.food || null; /* Restore the saved food label (or null) */

    if (pickedDate) { /* If a date type was previously chosen: */
      btnDateNext.disabled = false; /* Re-enable the date-type "Continue" button */
    }
    if (pickedDay) { /* If a calendar day was previously chosen: */
      datePicker.value = pickedDay; /* Re-fill the date input with the saved day */
      btnCalNext.disabled = false; /* Re-enable the calendar "Continue" button */
    }
    if (pickedTime) { /* If a time was previously chosen: */
      timePicker.value = pickedTime; /* Re-fill the time input with the saved time */
      btnTimeNext.disabled = false; /* Re-enable the time "Continue" button */
    }
    if (pickedFood) { /* If a food was previously chosen: */
      btnFoodNext.disabled = false; /* Re-enable the "Confirm" button */
    }

    /* Re-highlight the previously selected option buttons by comparing each button's data attribute to the saved values */
    document.querySelectorAll("#date-options .option").forEach((btn) => { /* Loops over every date-type option button */
      if (btn.dataset.date === pickedDate) btn.classList.add("selected"); /* If its stored data-date matches the saved pick, re-highlight it */
    });
    document.querySelectorAll("#food-options .option").forEach((btn) => { /* Loops over every food option button */
      if (btn.dataset.food === pickedFood) btn.classList.add("selected"); /* If its stored data-food matches the saved pick, re-highlight it */
    });

    /* Jump back to the furthest step the user had reached so they continue where they left off */
    if (pickedFood) goToStep(stepResult); /* If they had picked food, return to the result page */
    else if (pickedTime) goToStep(stepFood); /* Else if they picked a time, return to the food step */
    else if (pickedDay) goToStep(stepTime); /* Else if they picked a day, return to the time step */
    else if (pickedDate) goToStep(stepCalendar); /* Else if they picked a date type, return to the calendar step */
  }
  
  // ============ FLOATING BACKGROUND (LESSENED) ============ /* Section: Code that creates the floating hearts, sparkles, balloons, and butterflies — reduced for a cleaner look */
  const BG_ITEMS = [ /* An array of all possible floating background items. Each has an emoji and a CSS class to apply. */
    { emoji: "💖", cls: "heart" }, /* A pink heart emoji with the "heart" class (gets pink glow in CSS) */
    { emoji: "💗", cls: "heart" }, /* A growing heart emoji */
    { emoji: "💕", cls: "heart" }, /* Two hearts emoji */
    { emoji: "✨", cls: "sparkle" }, /* A sparkle emoji with the "sparkle" class (gets twinkle animation) */
    { emoji: "🌟", cls: "sparkle" }, /* A glowing star emoji */
    { emoji: "🎈", cls: "balloon" }, /* A balloon emoji (gets sway animation) */
    { emoji: "🦋", cls: "butterfly" } /* A butterfly emoji (gets sway animation) */
  ];

  function spawnFloat() { /* Defines a function that creates ONE floating background item and adds it to the page */
    const item = BG_ITEMS[Math.floor(Math.random() * BG_ITEMS.length)]; /* Picks a random item from the BG_ITEMS array (Math.random gives 0-1, multiplied by array length, then floored for a valid index) */
    const el = document.createElement("div"); /* Creates a brand new <div> element in memory (not yet on the page) */
    el.className = "float-item " + item.cls; /* Sets the div's CSS class to "float-item" plus the specific class (heart, sparkle, balloon, etc.) */
    el.innerHTML = "<span>" + item.emoji + "</span>"; /* Puts the emoji text inside a <span> so CSS can style it separately */
    const size = 16 + Math.random() * 22; /* Calculates a random emoji size between 16 and 38 pixels (smaller than before for a subtler look) */
    el.style.left = Math.random() * 100 + "vw"; /* Sets a random horizontal position (0% to 100% of viewport width) so items spawn at different places across the screen */
    el.firstChild.style.fontSize = size + "px"; /* Sets the emoji's font size to the random size we calculated */
    el.style.animationDuration = 8 + Math.random() * 10 + "s"; /* Sets a random animation duration between 8 and 18 seconds (slower, gentler float) */
    el.style.animationDelay = Math.random() * 2 + "s"; /* Sets a random delay (0 to 2s) before the item starts floating, so items don't all start at once */
    el.style.opacity = 0.5 + Math.random() * 0.3; /* Sets a random opacity between 0.5 and 0.8 for variety in brightness but keeping it subtle */
    $("#hearts").appendChild(el); /* Adds the newly created element to the #hearts container on the page */
    setTimeout(() => el.remove(), 20000); /* Schedules the element to be deleted from the page after 20 seconds (so floating items don't accumulate forever) */
  }

  setInterval(() => { /* Sets up a repeating timer that runs the inner function every 500 milliseconds (much slower = FEWER emojis) */
    if (Math.random() < 0.6) spawnFloat(); /* Only spawns a floating item 60% of the time each tick, further reducing the number of emojis */
  }, 500); /* The interval delay: 500 milliseconds between each potential spawn (was 110ms before) */

  for (let i = 0; i < 8; i++) setTimeout(spawnFloat, i * 250); /* Immediately spawns only 8 initial floating items (was 30 before), staggered 250ms apart */

  // ============ TWINKLING STAR FIELD ============ /* Section: Code that creates the small twinkling stars scattered in the background */
  function seedStars() { /* Defines a function that creates the initial field of fixed background stars */
    for (let i = 0; i < 15; i++) { /* Loops 15 times to create 15 stars (was 34 before, reduced for a cleaner look) */
      const star = document.createElement("div"); /* Creates a new <div> element in memory for one star */
      star.className = "bg-star"; /* Sets its CSS class to "bg-star" so it gets the proper styling and pulse animation */
      star.textContent = ["✦", "✧", "•", "+"][Math.floor(Math.random() * 4)]; /* Randomly picks one of 4 star symbols (✦, ✧, •, +) for visual variety */
      star.style.left = Math.random() * 100 + "vw"; /* Sets a random horizontal position (0% to 100% of viewport width) */
      star.style.top = Math.random() * 100 + "vh"; /* Sets a random vertical position (0% to 100% of viewport height) */
      star.style.fontSize = (7 + Math.random() * 12) + "px"; /* Sets a random star size between 7 and 19 pixels */
      star.style.animationDuration = (1.8 + Math.random() * 2.2) + "s"; /* Sets a random pulse speed between 1.8 and 4 seconds per star */
      star.style.animationDelay = Math.random() * 2 + "s"; /* Sets a random delay (0 to 2s) before each star starts pulsing so they don't blink in sync */
      $("#hearts").appendChild(star); /* Adds the star to the #hearts container on the page */
    }
  }
  seedStars(); /* Immediately calls the seedStars function to create all 15 stars when the script loads */

  // ============ CURSOR SPARKLES ============ /* Section: Code that spawns little sparkles that follow the user's mouse cursor */
  let lastSpark = 0; /* Records the timestamp of the last sparkle we created, used to throttle how fast sparkles spawn */

  document.addEventListener("pointermove", (e) => { /* Listens for any mouse/touch/stylus movement anywhere on the page */
    const now = Date.now(); /* Gets the current time in milliseconds since 1970 (a high-precision timestamp) */
    if (now - lastSpark < 120) return; /* Throttle: if less than 120ms has passed since the last sparkle, skip creating a new one (was 60ms, now even fewer sparkles) */
    lastSpark = now; /* Update the lastSpark timestamp to the current time (we just made a sparkle) */

    const s = document.createElement("div"); /* Creates a new <div> element in memory to be the sparkle */
    s.className = "float-item sparkle"; /* Sets its CSS classes to "float-item sparkle" for proper styling */
    s.innerHTML = "<span>✨</span>"; /* Puts a sparkle emoji inside a <span> */
    s.style.animation = "none"; /* Removes the default float animation (we'll use a custom transition instead) */
    s.style.position = "fixed"; /* Positions the sparkle relative to the viewport so it follows the cursor exactly */
    s.style.left = (e.clientX - 8) + "px"; /* Sets the sparkle's horizontal position to the cursor's X position (minus 8 to center it) */
    s.style.top = (e.clientY - 8) + "px"; /* Sets the sparkle's vertical position to the cursor's Y position (minus 8 to center it) */
    s.firstChild.style.fontSize = (10 + Math.random() * 8) + "px"; /* Sets a random sparkle size between 10 and 18 pixels */
    s.style.transition = "transform 0.9s ease-out, opacity 0.9s ease-out"; /* Sets up a CSS transition so the sparkle smoothly floats and fades over 0.9 seconds */
    s.style.opacity = "1"; /* Makes the sparkle fully visible */
    $("#hearts").appendChild(s); /* Adds the sparkle to the #hearts container */
    requestAnimationFrame(() => { /* Schedules a callback to run on the browser's next animation frame (after the sparkle has rendered) */
      s.style.transform = "translateY(-40px) rotate(120deg)"; /* Moves the sparkle up 40px and rotates it 120 degrees (the float-away effect) */
      s.style.opacity = "0"; /* Fades the sparkle to transparent */
    });
    setTimeout(() => s.remove(), 950); /* Schedules the sparkle to be deleted from the page after 950ms (after its transition finishes) */
  }, { passive: true }); /* "passive: true" tells the browser we won't call preventDefault, allowing for smoother performance */

  // ============ NO BUTTON DODGE + YES GROWTH ============ /* Section: The fun interaction where the "No" button runs away and the "Yes" button grows bigger */
  const NO_CRIES = [ /* An array of sad messages that appear in order (or cycling) when the user presses "No" repeatedly — the messages STILL say "No" but are pleading/dramatic */
    "No?! Okay… but I'll keep asking 🥺", /* Message shown the 1st time "No" is pressed */
    "No, really?? My heart skipped a beat 💔", /* Message shown the 2nd time */
    "No… are you sure?? 😢", /* Message shown the 3rd time */
    "No, no, no… my heart is crying 😭", /* Message shown the 4th time */
    "You keep saying No… please stop 💔💔", /* Message shown the 5th time */
    "No more No's, I'll be so lonely 🥺💧", /* Message shown the 6th time */
    "Really No?! I made ALL of this for you 💔😭", /* Message shown the 7th time */
    "Okay… I'll wait forever, even if you say No 😢", /* Message shown the 8th time */
    "If you don't I'll cry...Please say yes 💧😭" /* Message shown for the 9th press and reused for all later presses (last one) */
  ];

  const NO_LABELS = [ /* An array of label texts for the "No" button itself — every label ALWAYS starts with "No" so the button never turns into something else; only the emoji/emotion changes */
    "No 😅", /* Original label — the "No" button starts with this */
    "No 🙃", /* Label after the 2nd time the button runs away */
    "No… 🥺", /* Label after the 3rd time */
    "No=💔", /* Label after the 4th time */
    "No… 😭", /* Label after the 5th time */
    "No..........." /* Label after the 6th time and reused for all later presses (last one) */
  ];

  function cryBurst(x, y) { /* Defines a function that spawns a burst of tear/emoji particles at a given position (x, y) */
    const tears = ["💧", "💧", "😢", "😭", "💔", "😿"]; /* An array of tear and sad emojis that will appear in the burst */
    for (let i = 0; i < 8; i++) { /* Loops 8 times to create 8 tear particles per burst */
      const t = document.createElement("span"); /* Creates a new <span> element in memory for one tear */
      t.className = "tear"; /* Sets its CSS class to "tear" for the falling animation */
      t.textContent = tears[Math.floor(Math.random() * tears.length)]; /* Randomly picks one of the tear emojis from the array */
      t.style.left = (x - 12 + Math.random() * 26) + "px"; /* Sets horizontal position: near the X coordinate but scattered ±12px randomly so tears spread out */
      t.style.top = y + "px"; /* Sets vertical position to the given Y coordinate */
      t.style.fontSize = (14 + Math.random() * 14) + "px"; /* Sets a random tear size between 14 and 28 pixels */
      t.style.setProperty("--dx", (Math.random() * 60 - 30).toFixed(0)); /* Sets a CSS custom property --dx to a random value between -30 and +30 (controls sideways drift in the animation) */
      t.style.animationDuration = (1 + Math.random() * 0.8) + "s"; /* Sets a random falling duration between 1 and 1.8 seconds */
      document.body.appendChild(t); /* Adds the tear to the page body */
      setTimeout(() => t.remove(), 2400); /* Schedules the tear to be removed after 2.4 seconds (after the animation finishes) */
    }
  }

  function updateNoMessages() { /* Defines a function that updates both the sad message text, the crying GIF, and the "No" button's label */
    const idx = Math.min(noCount - 1, NO_CRIES.length - 1); /* Calculates which sad message to show. Uses Math.min to cap the index at the last message (no out-of-bounds errors when noCount gets huge) */
    noMessage.textContent = NO_CRIES[idx]; /* Puts the chosen sad message into the #no-message paragraph */
    noMessage.classList.remove("bump"); /* Removes the "bump" animation class so the animation can restart fresh */
    void noMessage.offsetWidth; /* Forces the browser to re-calculate the element's layout (flushes the current animation state). "void" just discards the value — this is a common trick to restart CSS animations */
    noMessage.classList.add("bump"); /* Re-adds the "bump" class, which restarts the pop-in animation on the message */

    const labelIdx = Math.min(noCount - 1, NO_LABELS.length - 1); /* Calculates which button label to use, capped at the last label */
    btnNo.textContent = NO_LABELS[labelIdx]; /* Updates the text on the "No" button to the chosen playful/sad label (always starts with "No") */

    showCryGif(); /* Shows the crying GIF alongside the sad message for an extra dramatic effect */
  }

  function showCryGif() { /* Defines a function that shows the crying GIF inside the no-message area */
    noMessage.classList.add("has-gif"); /* Adds the "has-gif" class so CSS displays the GIF (moves it above or beside the text) */
  }

  function dodgeNoButton() { /* Defines the main function that makes the "No" button jump away from the cursor */
    // Move the button to <body> so `position: fixed` uses the real viewport,
    // not the card (whose backdrop-filter would trap it as a containing block).
    // (Explanation: the card has a backdrop-filter which turns it into a "containing block" for fixed elements,
    //  meaning `position: fixed` would be relative to the card instead of the screen. Moving to body fixes this.)
    if (!noOnBody) { /* Checks if the button has NOT yet been moved to the body */
      noOnBody = true; /* Sets the flag to true so we only do this once (don't move it repeatedly) */
      document.body.appendChild(btnNo); /* Actually moves the "No" button from its original card location into the <body> element */
    }

    btnNo.classList.add("fixed"); /* Adds the "fixed" class which applies position:fixed and a high z-index in CSS */

    const btnW = btnNo.offsetWidth; /* Measures the actual rendered width of the "No" button in pixels */
    const btnH = btnNo.offsetHeight; /* Measures the actual rendered height of the "No" button in pixels */
    const margin = 16; /* Sets a minimum margin of 16px from the screen edges so the button never goes off-screen */

    const viewportW = window.innerWidth; /* Gets the current width of the browser's visible area (viewport) */
    const viewportH = window.innerHeight; /* Gets the current height of the browser's visible area (viewport) */

    const maxW = Math.max(margin, viewportW - btnW - margin * 2); /* Calculates the furthest right the button can go (viewport width minus button width minus both margins), with a minimum of 16px */
    const maxH = Math.max(margin, viewportH - btnH - margin * 2); /* Calculates the furthest down the button can go (viewport height minus button height minus both margins), with a minimum of 16px */

    const x = margin + Math.random() * maxW; /* Picks a random X position between the left margin and the max right position */
    const y = margin + Math.random() * maxH; /* Picks a random Y position between the top margin and the max bottom position */

    btnNo.style.left = x + "px"; /* Sets the button's left position in pixels (CSS position:fixed uses this) */
    btnNo.style.top = y + "px"; /* Sets the button's top position in pixels */
    btnNo.style.transform = "rotate(" + (Math.random() * 30 - 15) + "deg)"; /* Tilts the button at a random angle between -15 and +15 degrees for a playful look */

    noCount++; /* Increments the counter for how many times "No" has been pressed */
    const rect = btnNo.getBoundingClientRect(); /* Gets the button's current bounding rectangle (position and size relative to the viewport) */
    cryBurst(rect.left + rect.width / 2, rect.top); /* Fires a burst of tears from the top-center of the button (touched by the cursor) */
    updateNoMessages(); /* Updates the sad message, the GIF, and the button's changing label */

    growLevel += 0.15; /* Increases the growth level of the "Yes" button by 0.15 each time "No" is dodged */
    const scale = Math.min(1 + growLevel, 3); /* Calculates the new scale for the "Yes" button (1 + growth), capped at a maximum of 3x so it doesn't get absurdly huge */
    btnYes.style.setProperty("--grow", scale); /* Updates the --grow CSS variable on the Yes button, which controls its scale via CSS */
    btnYes.style.boxShadow = "0 " + (10 + growLevel * 25) + "px " + (30 + growLevel * 40) + /* Sets a custom box shadow that grows larger with each dodge: */
      "px rgba(255, 77, 136, " + Math.min(0.5 + growLevel * 0.1, 0.9) + ")"; /* ...horizontal 0, vertical offset and blur both grow with growLevel, and the pink opacity is capped at 0.9 */
  }

  btnNo.addEventListener("mouseover", dodgeNoButton); /* When the mouse hovers over the "No" button, it immediately dodges away */
  btnNo.addEventListener("touchstart", (e) => { e.preventDefault(); dodgeNoButton(); }, { passive: false }); /* On mobile: when the user touches the button, prevent the default action and dodge. passive:false is required so we can call preventDefault */
  btnNo.addEventListener("click", dodgeNoButton); /* As a fallback (in case the button doesn't dodge in time), clicking it also triggers the dodge */

  // ============ STEP NAVIGATION ============ /* Section: Logic for moving between the steps of the app */
  const steps = [stepLanding, stepDate, stepCalendar, stepTime, stepFood, stepResult]; /* An array holding references to all step sections in order */

  //restoreState(); /* Immediately call restoreState when the script loads to bring back any saved progress */

  function resetNoButton() { /* Defines a function that puts the "No" button back in its original home in the landing card and clears its floating style, so it only exists on Step 1 */
    if (noOnBody) { /* If the "No" button had been moved onto the <body> element while dodging: */
      noOnBody = false; /* Reset the flag so the next dodge correctly detects that it needs to move again */
      noOriginalParent.insertBefore(btnNo, noOriginalNext); /* Move the "No" button back into its original landing card location, right before its original next sibling */
    }
    btnNo.classList.remove("fixed"); /* Remove the "fixed" class so it's no longer positioned absolutely on the page */
    btnNo.style.left = ""; /* Clear the inline left position */
    btnNo.style.top = ""; /* Clear the inline top position */
    btnNo.style.transform = ""; /* Clear the inline rotation transform */
    btnNo.textContent = NO_LABELS[0]; /* Reset the button text back to the original "No 😅" label */
  }

  function goToStep(target) { /* Defines a function that transitions the app to a given step */
    steps.forEach((s) => s.classList.remove("active")); /* Loops through every step and removes the "active" class, hiding them all (due to CSS display:none) */
    target.classList.add("active"); /* Adds the "active" class to the target step only, making it visible (CSS) and triggering its entrance animation */
    window.scrollTo({ top: 0, behavior: "smooth" }); /* Smoothly scrolls the browser window back to the top so the user sees the step from the top */
    if (target !== stepLanding) resetNoButton(); /* If the user is moving AWAY from the landing page (they said "Yes"), reset and tuck the "No" button back into Step 1 so it doesn't keep floating on the other steps */
  }

  btnYes.addEventListener("click", () => goToStep(stepDate)); /* When the user clicks the "Yes" button, navigate from the landing page to the date type selection step */

  // ============ OPTIONS GRID ============ /* Section: Code that builds the clickable option cards (date types and food types) */
  function buildOptions(container, data, onPick, type) { /* Defines a reusable function to generate option buttons. Args: container (HTML element), data (array of options), onPick (callback run when an option is picked), type (string key for the data attribute) */
    container.innerHTML = ""; /* Clears the container of any existing content so we start fresh (in case of rebuilds) */
    data.forEach((item) => { /* Loops through every item in the provided data array (e.g., each date type or food type) */
      const button = document.createElement("button"); /* Creates a new <button> element in memory for this option */
      button.type = "button"; /* Sets the button type to "button" so it doesn't accidentally submit a form */
      button.className = "option"; /* Sets its CSS class to "option" so it gets the card styling */
      button.dataset[type] = item.label; /* Stores the item's label on the button as a data attribute (e.g., data-date="Pizza") for identification */
      button.innerHTML = /* Builds the button's inner HTML: */
        '<span class="opt-emoji" aria-hidden="true">' + item.emoji + "</span>" + /* ...a span with the emoji (marked aria-hidden so screen readers skip decoration) */
        "<span>" + item.label + "</span>"; /* ...plus a span with the text label */

      button.addEventListener("click", () => { /* When this option button is clicked: */
        container.querySelectorAll(".option") /* Find ALL option buttons inside the same container */
          .forEach((el) => el.classList.remove("selected")); /* ...and remove the "selected" class from each one (deselect everything) */
        button.classList.add("selected"); /* Then add "selected" to this specific button (highlighting it with the gradient style) */
        onPick(item.label); /* Call the provided callback function, passing the picked option's label */
      });

      container.appendChild(button); /* Adds the newly created button to the container on the page */
    });
  }

  buildOptions(dateOptions, DATE_TYPES, (label) => { /* Builds the date type options. The callback runs when a date is picked: */
    pickedDate = label; /* Save the picked date label into the pickedDate variable */
    btnDateNext.disabled = false; /* Enable the "Continue" button (it starts disabled) */
    saveState(); /* Auto-save the selection into localStorage so it's remembered on refresh */
  }, "date"); /* The data attribute key is "date" */

  buildOptions(foodOptions, FOOD_TYPES, (label) => { /* Builds the food options. The callback runs when a food is picked: */
    pickedFood = label; /* Save the picked food label into the pickedFood variable */
    btnFoodNext.disabled = false; /* Enable the "Confirm" button (it starts disabled) */
    saveState(); /* Auto-save the selection into localStorage */
  }, "food"); /* The data attribute key is "food" */

  btnDateNext.addEventListener("click", () => goToStep(stepCalendar)); /* When "Continue" (date type) is clicked, go to the calendar day step */
  btnCalNext.addEventListener("click", () => goToStep(stepTime)); /* When "Continue" (calendar day) is clicked, go to the time step */
  btnTimeBack.addEventListener("click", () => goToStep(stepCalendar)); /* When "Back" on the time step is clicked, go back to the calendar day step */
  btnFoodBack.addEventListener("click", () => goToStep(stepTime)); /* When "Back" on the food step is clicked, go back to the time step */

  // ============ DATE & TIME PICKERS LOGIC ============ /* Section: Enabling the Continue buttons only after a valid date/time is chosen */
  datePicker.addEventListener("input", () => { /* Whenever the calendar date input changes: */
    if (datePicker.value) { /* If the user has actually selected a valid date (the input has a value): */
      pickedDay = datePicker.value; /* Save the selected calendar day string into the pickedDay variable */
      btnCalNext.disabled = false; /* Enable the "Continue" button on the calendar day step */
      saveState(); /* Auto-save the selection into localStorage */
    } else { /* If the user cleared the date: */
      btnCalNext.disabled = true; /* Keep the Continue button disabled until a valid date is picked again */
    }
  });

  timePicker.addEventListener("input", () => { /* Whenever the time input changes: */
    if (timePicker.value) { /* If the user has actually selected a valid time (the input has a value): */
      pickedTime = timePicker.value; /* Save the selected time string into the pickedTime variable */
      btnTimeNext.disabled = false; /* Enable the "Continue" button on the time step */
      saveState(); /* Auto-save the selection into localStorage */
    } else { /* If the user cleared the time: */
      btnTimeNext.disabled = true; /* Keep the Continue button disabled until a valid time is picked again */
    }
  });

  btnTimeNext.addEventListener("click", () => goToStep(stepFood)); /* When "Continue" (time) is clicked, go to the food step */

  btnFoodNext.addEventListener("click", () => { /* When "Confirm" is clicked (the final confirmation): */
    $("#result-date").textContent = pickedDate; /* Fill the "Our date" summary value with the picked date type label */
    $("#result-day").textContent = formatDay(pickedDay); /* Fill the "The day" summary value with the formatted calendar date (e.g., "Mon, Sep 7") */
    $("#result-time").textContent = formatTime(pickedTime); /* Fill the "The time" summary value with the formatted time (e.g., "5:30 PM") */
    $("#result-food").textContent = pickedFood; /* Fill the "Our food" summary value with the picked food label */
    goToStep(stepResult); /* Navigate to the result step */
    burstConfetti(); /* Fire a confetti celebration (defined below) */
  });

  function formatDay(dateStr) { /* Defines a helper function that turns a raw date string (YYYY-MM-DD) into a friendly format like "Mon, Sep 7" */
    if (!dateStr) return "—"; /* If there's no date (shouldn't happen after picking), just show a dash placeholder */
    const d = new Date(dateStr + "T00:00:00"); /* Creates a JavaScript Date object from the string (adding T00:00:00 to avoid timezone errors) */
    return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }); /* Formats it as e.g. "Mon, Sep 7" using the locale of the user's browser */
  }

  function formatTime(timeStr) { /* Defines a helper function that turns a raw time string (HH:MM) into a 12-hour format like "5:30 PM" */
    if (!timeStr) return "—"; /* If there's no time, just show a dash placeholder */
    const [h, m] = timeStr.split(":").map(Number); /* Splits the "HH:MM" string on the colon and converts both parts to numbers */
    const suffix = h >= 12 ? "PM" : "AM"; /* Determines if the hour is in the afternoon (PM) or morning (AM) */
    const hour12 = ((h + 11) % 12) + 1; /* Converts the 24-hour hour to 12-hour format (e.g., 13 → 1, 0 → 12) */
    return hour12 + ":" + (m < 10 ? "0" + m : m) + " " + suffix; /* Builds the final string like "5:30 PM", padding single-digit minutes with a leading zero */
  }

  // ============ CONFETTI ============ /* Section: The confetti celebration that fires on the result page */
  const COLORS = ["#ff4d88", "#ff80ab", "#b24592", "#ffd166", "#00bbf9", "#9b5de5", "#00f5d4"]; /* An array of colorful hex colors for the confetti pieces */

  function burstConfetti() { /* Defines a function that spawns confetti pieces falling from the top */
    const count = Math.min(140, Math.floor(window.innerWidth / 7)); /* Calculates how many confetti pieces to spawn (viewport width / 7), capped at 140 so smaller screens don't get too many */
    for (let i = 0; i < count; i++) { /* Loops to create the calculated number of confetti pieces */
      const piece = document.createElement("div"); /* Creates a new <div> element in memory for one confetti piece */
      piece.className = "confetti"; /* Sets its CSS class to "confetti" for the falling animation and styling */
      piece.style.left = Math.random() * 100 + "vw"; /* Sets a random horizontal position across the screen (0% to 100%) */
      piece.style.top = -20 + Math.random() * -40 + "px"; /* Sets a random starting position ABOVE the screen (between -20px and -60px) so they appear to fall from above */
      piece.style.background = COLORS[Math.floor(Math.random() * COLORS.length)]; /* Assigns a random color from the COLORS array to each piece */
      piece.style.width = 6 + Math.random() * 10 + "px"; /* Sets a random width between 6 and 16 pixels */
      piece.style.height = 8 + Math.random() * 12 + "px"; /* Sets a random height between 8 and 20 pixels */
      piece.style.borderRadius = Math.random() > 0.5 ? "50%" : "2px"; /* Randomly decides if the piece is circular (50% radius) or rectangular (small 2px radius) */
      piece.style.animationDuration = 2.5 + Math.random() * 2.5 + "s"; /* Sets a random falling duration between 2.5 and 5 seconds */
      piece.style.animationDelay = Math.random() * 0.6 + "s"; /* Sets a random delay (0 to 0.6s) so pieces don't all start falling at the exact same moment */
      piece.style.opacity = 0.85; /* Sets opacity to 85% so the colors look a bit softer */
      document.body.appendChild(piece); /* Adds the confetti piece to the page body */
      setTimeout(() => piece.remove(), 6500); /* Schedules each piece to be removed after 6.5 seconds (after its animation completes) */
    }
  }

  // ============ SAVE PLAN TO SYSTEM (HTML + TXT) ============ /* Section: Writes the user's final date plan out as a real .html file and a real .txt file into a folder they choose */
  function buildTxtContent() { /* Defines a function that builds the plain-text version of the date plan */
    const dateLabel = pickedDate || "—"; /* The chosen date-type label (or a dash if missing) */
    const dayLabel = formatDay(pickedDay); /* The formatted calendar day (e.g. "Mon, Sep 7") */
    const timeLabel = formatTime(pickedTime); /* The formatted time (e.g. "5:30 PM") */
    const foodLabel = pickedFood || "—"; /* The chosen food label (or a dash if missing) */
    return [ /* Returns an array that joins into a multi-line TXT document */
      "========================================", /* A simple text divider line */
      "      WILL YOU BE MY DATE? PLAN", /* The title of the plan */
      "========================================", /* Another divider line */
      "", /* An empty line for spacing */
      "Our date : " + dateLabel, /* The chosen date type */
      "The day  : " + dayLabel, /* The chosen calendar day */
      "The time : " + timeLabel, /* The chosen time */
      "Our food : " + foodLabel, /* The chosen food */
      "", /* An empty line for spacing */
      "Thank you for saying yes!", /* A closing thank-you note */
      "I love you <3", /* A sweet final line */
      "========================================" /* A closing divider */
    ].join("\n"); /* Joins all array lines with a newline character to make a readable text file */
  }

  function buildHtmlContent() { /* Defines a function that builds a complete, standalone HTML page with the date plan printed nicely */
    const dateLabel = pickedDate || "—"; /* The chosen date-type label */
    const dayLabel = formatDay(pickedDay); /* The formatted calendar day */
    const timeLabel = formatTime(pickedTime); /* The formatted time */
    const foodLabel = pickedFood || "—"; /* The chosen food label */
    return `<!DOCTYPE html> <!-- The saved plan is itself a valid HTML document -->
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Our Date Plan 💕</title>
  <style>
    body { font-family: 'Segoe UI', sans-serif; background: linear-gradient(135deg, #ffd6e7, #ffe6f0); min-height: 100vh; display: flex; align-items: center; justify-content: center; margin: 0; padding: 20px; color: #3a1a33; }
    .card { background: rgba(255,255,255,0.85); border-radius: 24px; padding: 40px; max-width: 480px; width: 100%; box-shadow: 0 20px 50px rgba(179,47,122,0.3); text-align: center; }
    h1 { font-size: 34px; margin: 0 0 6px; }
    h2 { font-size: 20px; font-weight: 600; opacity: 0.8; margin: 0 0 24px; }
    .row { background: rgba(255,77,136,0.08); border: 2px solid rgba(255,77,136,0.2); border-radius: 14px; padding: 14px; margin: 10px 0; }
    .label { font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; opacity: 0.6; }
    .value { font-size: 22px; font-weight: 800; color: #7b2b6e; margin-top: 4px; }
    .love { font-size: 28px; font-weight: bold; margin-top: 18px; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Yayyy! I can't wait! 💫</h1>
    <h2>Here's our perfect plan…</h2>
    <div class="row"><div class="label">Our date</div><div class="value">${dateLabel}</div></div>
    <div class="row"><div class="label">The day</div><div class="value">${dayLabel}</div></div>
    <div class="row"><div class="label">The time</div><div class="value">${timeLabel}</div></div>
    <div class="row"><div class="label">Our food</div><div class="value">${foodLabel}</div></div>
    <div class="love">Thank you for saying yes,<br/>I love you ❤️</div>
  </div>
</body>
</html>`; /* Returns the complete HTML string built with the user's chosen values */
  }

  async function savePlanFiles() { /* Defines an async function that writes both the .txt and .html files to a folder the user picks */
    if (typeof window.showDirectoryPicker !== "function") { /* Checks if the browser supports the File System Access API (writing real files) */
      alert("Your browser doesn't support saving files directly. Please use Chrome or Edge to save the plan."); /* Tells the user to use a supported browser */
      return; /* Stops here since we can't write files */
    }
    if (!pickedDate && !pickedDay && !pickedTime && !pickedFood) { /* If nothing has been selected yet: */
      alert("Please plan your date first, then save it."); /* Warns the user to make selections first */
      return; /* Stops here */
    }
    const txtContent = buildTxtContent(); /* Builds the .txt file contents */
    const htmlContent = buildHtmlContent(); /* Builds the .html file contents */
    try { /* Wraps the file-writing in try/catch to handle a user cancelling the folder picker */
      const dir = await window.showDirectoryPicker(); /* Opens a folder picker dialog and lets the user choose where to save; waits for their choice */
      const txtHandle = await dir.getFileHandle("our-date-plan.txt", { create: true }); /* Creates (or opens) the .txt file inside the chosen folder */
      const txtWritable = await txtHandle.createWritable(); /* Opens a writable stream to that .txt file */
      await txtWritable.write(txtContent); /* Writes the text plan content into the .txt file */
      await txtWritable.close(); /* Closes (and saves) the .txt file */

      const htmlHandle = await dir.getFileHandle("our-date-plan.html", { create: true }); /* Creates (or opens) the .html file inside the chosen folder */
      const htmlWritable = await htmlHandle.createWritable(); /* Opens a writable stream to that .html file */
      await htmlWritable.write(htmlContent); /* Writes the HTML plan content into the .html file */
      await htmlWritable.close(); /* Closes (and saves) the .html file */

      alert("Saved! You can now find 'our-date-plan.txt' and 'our-date-plan.html' in the folder you picked."); /* Confirms success to the user */
    } catch (err) { /* If the user closed the folder picker without choosing, or any write fails: */
      /* silently ignore — the user simply cancelled, so no files are written */
    }
  }

  btnSavePlan.addEventListener("click", savePlanFiles); /* When "Save my plan" is clicked, calls savePlanFiles to write the files */

  // ============ RESTART ============ /* Section: Logic for resetting the app when the "Start over" button is clicked */
  btnRestart.addEventListener("click", () => { /* When "Start over" is clicked: */
    pickedDate = null; /* Reset the picked date type to null (nothing selected) */
    pickedDay = null; /* Reset the picked calendar day to null (nothing selected) */
    pickedTime = null; /* Reset the picked time to null (nothing selected) */
    pickedFood = null; /* Reset the picked food to null (nothing selected) */
    btnDateNext.disabled = true; /* Disable the date-type "Continue" button again */
    btnCalNext.disabled = true; /* Disable the calendar-day "Continue" button again */
    btnTimeNext.disabled = true; /* Disable the time "Continue" button again */
    btnFoodNext.disabled = true; /* Disable the "Confirm" button again */
    datePicker.value = ""; /* Clear the selected calendar date input */
    timePicker.value = ""; /* Clear the selected time input */
    document.querySelectorAll(".option.selected").forEach((b) => b.classList.remove("selected")); /* Remove the "selected" highlight from all option buttons */
    localStorage.removeItem(CACHE_KEY); /* Clear the saved state from localStorage since the user is starting over fresh */
    resetNoButton(); /* Restore the "No" button to its original landing-card home and clear its floating style */
    noCount = 0; /* Reset the press counter to 0 */
    noMessage.textContent = ""; /* Clear the sad message text */
    noMessage.classList.remove("bump"); /* Remove the bump animation class */
    noMessage.classList.remove("has-gif"); /* Hide the crying GIF again */
    growLevel = 0; /* Reset the growth level of the "Yes" button to 0 */
    btnYes.style.setProperty("--grow", 1); /* Reset the Yes button's scale back to 1 (normal size) */
    btnYes.style.boxShadow = ""; /* Clear the custom box shadow, returning to the CSS default */
    goToStep(stepLanding); /* Navigate back to the landing page (the very first step) */
  });

  // ============ RESPONSIVE RESCUE ============ /* Section: Keeps the dodging "No" button on-screen if the window is resized */
  // Keep the "No" button safely on screen if the window resizes while it's dodging.
  window.addEventListener("resize", () => { /* Listens for the browser window being resized */
    if (!btnNo.classList.contains("fixed")) return; /* If the "No" button isn't currently in its floating/fixed state, do nothing (no need to reposition it) */
    const btnW = Math.max(btnNo.offsetWidth, 80); /* Get the button width, but ensure it's at least 80px (protects against measuring 0 before render) */
    const btnH = Math.max(btnNo.offsetHeight, 40); /* Get the button height, but ensure it's at least 40px (same protection) */
    const margin = 16; /* Keep the same 16px margin from the screen edges */
    const x = Math.min(Math.max(parseFloat(btnNo.style.left) || 0, margin), window.innerWidth - btnW - margin); /* Clamp the X position: at least 16px from left, but no more than (window width - button width - margin) — keeps it on-screen */
    const y = Math.min(Math.max(parseFloat(btnNo.style.top) || 0, margin), window.innerHeight - btnH - margin); /* Same clamping for Y position so the button never goes below the viewport */
    btnNo.style.left = x + "px"; /* Apply the corrected left position */
    btnNo.style.top = y + "px"; /* Apply the corrected top position */
  });
})(); /* This closes the IIFE (Immediately Invoked Function Expression). Everything above runs safely inside its own scope and is not accessible globally. */
