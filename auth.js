/**
 * Neural Core AI - Authentication & Access Gatekeeper
 * Authorized Account: 358966OoOo@proton.me
 * Authorized Password: 359755OoOo@
 */
(function() {
  const AUTH_ACCOUNT = "358966OoOo@proton.me";
  const AUTH_PASS = "359755OoOo@";
  const STORAGE_KEY = "neural_core_auth_status";
  const USER_KEY = "neural_core_auth_user";

  window.NC_AUTH = {
    targetAccount: AUTH_ACCOUNT,

    isAuthenticated: function() {
      try {
        const status = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
        const user = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
        return status === "authenticated" && user === AUTH_ACCOUNT;
      } catch (e) {
        return false;
      }
    },

    init: function() {
      const overlay = document.getElementById("nc-auth-overlay");
      if (!overlay) return;

      if (this.isAuthenticated()) {
        overlay.style.display = "none";
        document.body.classList.remove("nc-auth-locked");
        this.updateUserUI(AUTH_ACCOUNT);
      } else {
        overlay.style.display = "flex";
        overlay.style.opacity = "1";
        overlay.style.pointerEvents = "auto";
        document.body.classList.add("nc-auth-locked");
        setTimeout(() => {
          const accInput = document.getElementById("nc-login-account");
          if (accInput) {
            accInput.value = "";
            accInput.focus();
          }
          const pwInput = document.getElementById("nc-login-password");
          if (pwInput) pwInput.value = "";
        }, 150);
      }

      if (window.lucide && typeof window.lucide.createIcons === "function") {
        try { window.lucide.createIcons(); } catch(e){}
      }
    },

    switchTab: function(tabName) {
      const loginView = document.getElementById("nc-auth-login-view");
      const regView = document.getElementById("nc-auth-register-view");
      const tabLogin = document.getElementById("nc-tab-login");
      const tabReg = document.getElementById("nc-tab-register");
      const errBox = document.getElementById("nc-auth-error-msg");

      if (errBox) errBox.style.display = "none";

      if (tabName === "login") {
        if (loginView) loginView.style.display = "block";
        if (regView) regView.style.display = "none";
        if (tabLogin) tabLogin.classList.add("active");
        if (tabReg) tabReg.classList.remove("active");
        const pwInput = document.getElementById("nc-login-password");
        if (pwInput) pwInput.focus();
      } else {
        if (loginView) loginView.style.display = "none";
        if (regView) regView.style.display = "block";
        if (tabLogin) tabLogin.classList.remove("active");
        if (tabReg) tabReg.classList.add("active");
        const inviteInput = document.getElementById("nc-invite-code-input");
        if (inviteInput) inviteInput.focus();
      }
      if (window.lucide && typeof window.lucide.createIcons === "function") {
        try { window.lucide.createIcons(); } catch(e){}
      }
    },

    togglePasswordVisibility: function() {
      const pwInput = document.getElementById("nc-login-password");
      const eyeIcon = document.getElementById("nc-pw-eye-icon");
      if (!pwInput) return;
      if (pwInput.type === "password") {
        pwInput.type = "text";
        if (eyeIcon) eyeIcon.setAttribute("data-lucide", "eye-off");
      } else {
        pwInput.type = "password";
        if (eyeIcon) eyeIcon.setAttribute("data-lucide", "eye");
      }
      if (window.lucide && typeof window.lucide.createIcons === "function") {
        try { window.lucide.createIcons(); } catch(e){}
      }
    },

    handleLogin: function(e) {
      if (e && e.preventDefault) e.preventDefault();
      
      const accInput = document.getElementById("nc-login-account");
      const pwInput = document.getElementById("nc-login-password");
      const rememberCheckbox = document.getElementById("nc-remember-me");
      const errBox = document.getElementById("nc-auth-error-msg");
      const errText = document.getElementById("nc-auth-error-text");
      const submitBtn = document.getElementById("nc-login-submit-btn");
      const card = document.querySelector(".nc-auth-card");

      const accVal = accInput ? accInput.value.trim() : "";
      const pwVal = pwInput ? pwInput.value : "";

      if (errBox) errBox.style.display = "none";

      if (accVal === AUTH_ACCOUNT && pwVal === AUTH_PASS) {
        // Success
        if (submitBtn) {
          submitBtn.disabled = true;
          const btnContent = submitBtn.querySelector(".nc-btn-content");
          const btnSpinner = submitBtn.querySelector(".nc-btn-spinner");
          if (btnContent) btnContent.style.display = "none";
          if (btnSpinner) btnSpinner.style.display = "inline-flex";
        }

        try {
          if (rememberCheckbox && rememberCheckbox.checked) {
            localStorage.setItem(STORAGE_KEY, "authenticated");
            localStorage.setItem(USER_KEY, AUTH_ACCOUNT);
            localStorage.setItem("neural_core_login_timestamp", Date.now().toString());
          } else {
            sessionStorage.setItem(STORAGE_KEY, "authenticated");
            sessionStorage.setItem(USER_KEY, AUTH_ACCOUNT);
            localStorage.setItem(STORAGE_KEY, "authenticated");
            localStorage.setItem(USER_KEY, AUTH_ACCOUNT);
          }
        } catch(err){}

        setTimeout(() => {
          const overlay = document.getElementById("nc-auth-overlay");
          if (overlay) {
            overlay.style.transition = "opacity 0.35s ease, transform 0.35s ease";
            overlay.style.opacity = "0";
            overlay.style.pointerEvents = "none";
            setTimeout(() => {
              overlay.style.display = "none";
              document.body.classList.remove("nc-auth-locked");
            }, 350);
          }
          this.updateUserUI(AUTH_ACCOUNT);
        }, 400);
      } else {
        // Validation Failed
        if (errBox && errText) {
          errText.textContent = "账号或密码错误，请核对后重试！";
          errBox.style.display = "flex";
        }
        if (card) {
          card.classList.remove("nc-shake");
          void card.offsetWidth; // trigger reflow
          card.classList.add("nc-shake");
        }
        if (pwInput) {
          pwInput.value = "";
          pwInput.focus();
        }
        if (window.lucide && typeof window.lucide.createIcons === "function") {
          try { window.lucide.createIcons(); } catch(e){}
        }
      }
    },

    handleInviteVerify: function() {
      const inviteInput = document.getElementById("nc-invite-code-input");
      const feedback = document.getElementById("nc-invite-feedback");
      if (!inviteInput || !feedback) return;

      const val = inviteInput.value.trim();
      if (!val) {
        feedback.style.display = "block";
        feedback.style.color = "#f87171";
        feedback.textContent = "⚠️ 请输入有效的内测邀请码！";
        return;
      }

      feedback.style.display = "block";
      feedback.style.color = "#fbbf24";
      feedback.textContent = "🔍 正在核验邀请码状态...";

      setTimeout(() => {
        feedback.style.color = "#f87171";
        feedback.innerHTML = "❌ 该邀请码未开放或已失效。当前注册仅限内部受邀用户，请直接使用已授权账号登录。";
      }, 600);
    },

    logout: function() {
      try {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(USER_KEY);
        sessionStorage.removeItem(STORAGE_KEY);
        sessionStorage.removeItem(USER_KEY);
      } catch(e){}

      const overlay = document.getElementById("nc-auth-overlay");
      const submitBtn = document.getElementById("nc-login-submit-btn");
      const pwInput = document.getElementById("nc-login-password");
      const accInput = document.getElementById("nc-login-account");
      const errBox = document.getElementById("nc-auth-error-msg");

      if (submitBtn) {
        submitBtn.disabled = false;
        const btnContent = submitBtn.querySelector(".nc-btn-content");
        const btnSpinner = submitBtn.querySelector(".nc-btn-spinner");
        if (btnContent) btnContent.style.display = "inline-flex";
        if (btnSpinner) btnSpinner.style.display = "none";
      }

      if (pwInput) pwInput.value = "";
      if (accInput) {
        accInput.value = "";
        accInput.focus();
      }
      if (errBox) errBox.style.display = "none";

      this.switchTab("login");

      if (overlay) {
        overlay.style.display = "flex";
        overlay.style.opacity = "1";
        overlay.style.pointerEvents = "auto";
        document.body.classList.add("nc-auth-locked");
      }

      const userPopup = document.getElementById("user-menu-popup");
      if (userPopup) userPopup.classList.remove("active");
    },

    updateUserUI: function(account) {
      try {
        const userNameEl = document.querySelector(".chat-sidebar-user .user-name");
        const userPlanEl = document.querySelector(".chat-sidebar-user .user-plan");
        const userAvatarEl = document.querySelector(".chat-sidebar-user .user-avatar");
        if (userNameEl) userNameEl.textContent = account ? account.split('@')[0] : "Sunny";
        if (userPlanEl) userPlanEl.textContent = "已授权内测账户";
        if (userAvatarEl) userAvatarEl.textContent = account ? account.charAt(0).toUpperCase() : "S";
      } catch(e){}
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() {
      window.NC_AUTH.init();
    });
  } else {
    window.NC_AUTH.init();
  }
})();
