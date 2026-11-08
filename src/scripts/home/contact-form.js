/*
 * Contact form: floating labels, live checks, topic chips, character count,
 * spam checks, and sending to Formspree.
 */
export function initContactForm() {
  var form = document.getElementById("contact-form");
  if (!form) return;

  var loadedAt = Date.now();

  // Sends the message to Formspree, which emails it to me
  function sendForm(data) {
    // Combine the picked topics into one line, like "New website, PHP upgrade"
    var topics = data.getAll("topics");
    data.delete("topics");
    data.set("topics", topics.length ? topics.join(", ") : "Not specified");

    return fetch(form.action, {
      method: "POST",
      body: data,
      headers: { Accept: "application/json" },
    }).then(function (res) {
      if (!res.ok) throw new Error("Formspree returned " + res.status);
      return res;
    });
  }

  var fields = {
    name: {
      el: form.querySelector("#cf-name"),
      check: function (v) {
        return v.trim().length >= 2 ? "" : "Please enter your name.";
      },
    },
    email: {
      el: form.querySelector("#cf-email"),
      check: function (v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())
          ? ""
          : "Please enter a valid email address, like name@company.com.";
      },
    },
    message: {
      el: form.querySelector("#cf-message"),
      check: function (v) {
        return v.trim().length >= 10
          ? ""
          : "Please write a little more about your project (at least 10 characters).";
      },
    },
  };

  function validate(key, show) {
    var f = fields[key],
      msg = f.check(f.el.value),
      wrap = f.el.closest(".cf-field");
    var err = wrap.querySelector(".cf-error");
    wrap.classList.toggle("is-valid", !msg);
    if (show) {
      wrap.classList.toggle("is-invalid", !!msg);
      err.textContent = msg;
      f.el.setAttribute("aria-invalid", msg ? "true" : "false");
      if (msg) f.el.setAttribute("aria-describedby", err.id);
      else f.el.removeAttribute("aria-describedby");
    } else if (!msg) {
      wrap.classList.remove("is-invalid");
      err.textContent = "";
      f.el.removeAttribute("aria-invalid");
    }
    return !msg;
  }

  Object.keys(fields).forEach(function (key) {
    var el = fields[key].el,
      touched = false;
    el.addEventListener("blur", function () {
      if (el.value.trim()) {
        touched = true;
        validate(key, true);
      }
    });
    el.addEventListener("input", function () {
      validate(key, touched);
    });
  });

  // Optional company field just gets the check mark when filled
  var company = form.querySelector("#cf-company");
  company.addEventListener("input", function () {
    company.closest(".cf-field").classList.toggle("is-valid", company.value.trim().length > 1);
  });

  // Textarea grows with its text, and shows a character count
  var msg = fields.message.el,
    count = document.getElementById("cf-count");
  function grow() {
    msg.style.height = "auto";
    msg.style.height = Math.min(msg.scrollHeight, 360) + "px";
    count.textContent = msg.value.length;
    count.parentNode.classList.toggle("is-near", msg.value.length > 1800);
  }
  msg.addEventListener("input", grow);

  // Topic chips get a little pop when picked
  form.querySelectorAll(".cf-topics input").forEach(function (box) {
    box.addEventListener("change", function () {
      var chip = box.nextElementSibling;
      chip.classList.remove("pop");
      void chip.offsetWidth;
      chip.classList.add("pop");
    });
  });

  var btn = form.querySelector(".cf-submit"),
    label = form.querySelector(".cf-submit-label");
  var fieldsBox = form.querySelector(".cf-fields"),
    success = form.querySelector(".cf-success");
  var formError = document.getElementById("cf-form-error");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    formError.textContent = "";
    var ok = ["name", "email", "message"]
      .map(function (k) {
        return validate(k, true);
      })
      .every(Boolean);
    if (!ok) {
      var first = form.querySelector(".cf-field.is-invalid input, .cf-field.is-invalid textarea");
      if (first) first.focus();
      form.classList.remove("shake");
      void form.offsetWidth;
      form.classList.add("shake");
      return;
    }
    // Spam checks: the hidden field was filled in, or the form was sent too quickly.
    // Show the normal success message without sending, so bots don't know they were caught.
    if (form.querySelector("#cf-website").value || Date.now() - loadedAt < 3000) {
      fieldsBox.hidden = true;
      success.hidden = false;
      return;
    }

    var data = new FormData(form);
    btn.disabled = true;
    btn.classList.add("is-sending");
    label.textContent = "Sending…";
    sendForm(data)
      .then(function () {
        btn.classList.remove("is-sending");
        btn.classList.add("is-sent");
        label.textContent = "Sent";
        setTimeout(function () {
          fieldsBox.hidden = true;
          success.hidden = false;
          success.focus();
        }, 450);
      })
      .catch(function () {
        btn.disabled = false;
        btn.classList.remove("is-sending");
        label.textContent = "Send message";
        formError.textContent =
          "Sorry, your message couldn’t be sent. Please try again, or email me at jcapiraldev@gmail.com.";
      });
  });

  form.querySelector(".cf-again").addEventListener("click", function () {
    form.reset();
    grow();
    form.querySelectorAll(".cf-field").forEach(function (f) {
      f.classList.remove("is-valid", "is-invalid");
    });
    btn.disabled = false;
    btn.classList.remove("is-sent");
    label.textContent = "Send message";
    success.hidden = true;
    fieldsBox.hidden = false;
    fields.name.el.focus();
  });
}
