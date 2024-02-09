(function () {
  const callMeInfoBtn = document.getElementById("call-me-info-btn");
  const endCallBtn = document.getElementById("end-call-btn");
  const changeNumberBtn = document.getElementById("change-number-btn");
  const resendBtn = document.getElementById("resend-btn");
  const displayUserNumber = document.querySelectorAll(".display-user-number");

  let user_input = {};
  let evtSource = null;
  let userPhoneNumber = null;

  const heroMainCont = document.querySelector(".hero_main");
  const heroConfirmCont = document.querySelector(".hero_confirm");
  const heroVerifyCont = document.querySelector(".hero_verify");
  const heroCallingCont = document.querySelector(".hero_calling-icon");
  const heroChatCont = document.querySelector(".hero_chat");
  const heroCallEndCont = document.querySelector(".hero_call-ended");

  const chatMessagesContainer = document.getElementById(
    "chat-messages-container"
  );

  const confirmForm = document.getElementById("wf-form-Hero-AI-Calling-Form");
  const verificationForm = document.getElementById(
    "wf-form-Hero-AI-Verification-Form"
  );

  const verifyApi = async ({ phone }) =&gt; {
    let myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    let raw = JSON.stringify({
      phoneNumber: phone,
    });

    let requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    try {
      const res = await fetch(
        "https://api.stage.voxia.ai/public/verification",
        requestOptions
      );

      return res.json();
    } catch (e) {
      return null;
    }
  };

  const callApi = ({ phone, code, name, company = "AI World" }) =&gt; {
    let myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    let raw = JSON.stringify({
      name: name,
      phoneNumber: phone,
      code: code,
      data: {
        company: company,
      },
    });

    let requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    return new Promise((resolve) =&gt; {
      fetch("https://api.stage.voxia.ai/public/call", requestOptions)
        .then((response) =&gt; response.json())
        .then((result) =&gt; resolve(result))
        .catch((error) =&gt; console.log("error", error))
        .finally(() =&gt; resolve(null));
    });
  };

  const callResEvents = (id) =&gt; {
    evtSource = new EventSource(`https://api.stage.voxia.ai/public/call/${id}`);
    evtSource.onmessage = (e) =&gt; {
      const data = JSON.parse(e.data);
      console.log(data);
      if (heroCallingCont) {
        heroCallingCont.classList.add("hide");
      }
      if (heroChatCont) {
        heroChatCont.classList.remove("hide");
      }

      if (data.event === "messages") {
        const messages = data.messages;
        const html = messages
          .map((message) =&gt; {
            return `&lt;div class="message ${message.role}"&gt;${message.content}&lt;/div&gt;`;
          })
          .join("");
        chatMessagesContainer.innerHTML = html;

        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
      }
      if (data.event === "end") {
        evtSource.close();

        if (heroChatCont) {
          heroChatCont.classList.add("hide");
        }
        if (heroCallEndCont) {
          heroCallEndCont.classList.remove("hide");
        }
      }
    };
  };

  endCallBtn.onclick = (e) =&gt; {
    e.preventDefault();
    if (evtSource) {
      evtSource.close();
    }

    if (heroChatCont) {
      heroChatCont.classList.add("hide");
    }
    if (heroCallEndCont) {
      heroCallEndCont.classList.remove("hide");
    }
  };

  callMeInfoBtn.onclick = (e) =&gt; {
    e.preventDefault();

    if (heroMainCont) {
      heroMainCont.classList.add("hide");
    }
    if (heroConfirmCont) {
      heroConfirmCont.classList.remove("hide");
    }
  };

  confirmForm.onsubmit = async (e) =&gt; {
    e.preventDefault();
    const formData = new FormData(e.target);
    userPhoneNumber = formData.get("Phone-Number");

    displayUserNumber.forEach((element) =&gt; {
      element.innerHTML = userPhoneNumber;
    });

    for (const [key, value] of formData.entries()) {
      user_input[key] = value;
    }

    const res = await verifyApi({ phone: formData.get("Phone-Number") });

    if (res?.status &amp;&amp; res.status === "success") {
      if (heroConfirmCont) {
        heroConfirmCont.classList.add("hide");
      }
      if (heroVerifyCont) {
        heroVerifyCont.classList.remove("hide");
      }
    }
  };

  verificationForm.onsubmit = async (e) =&gt; {
    e.preventDefault();
    const formData = new FormData(e.target);
    user_input["Verification-2"] = formData.get("Verification-2");

    const { data } = await callApi({
      name: user_input["Name"],
      phone: user_input["Phone-Number"],
      code: user_input["Verification-2"],
    });

    if (data?.id) {
      if (heroVerifyCont) {
        heroVerifyCont.classList.add("hide");
      }
      if (heroCallingCont) {
        heroCallingCont.classList.remove("hide");
      }

      callResEvents(data.id);
    }
  };

  changeNumberBtn.onclick = (e) =&gt; {
    e.preventDefault();
    if (heroVerifyCont) {
      heroVerifyCont.classList.add("hide");
    }
    if (heroConfirmCont) {
      heroConfirmCont.classList.remove("hide");
    }
  };

  resendBtn.onclick = async (e) =&gt; {
    e.preventDefault();
    const res = await verifyApi({ phone: userPhoneNumber });
    if (res?.status &amp;&amp; res.status === "success") {
      resendBtn.classList.add("disbaled");
    }
  };
})();
