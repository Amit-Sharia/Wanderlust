(() => {
  'use strict'

  const pageLoader = document.getElementById('pageLoader')

  const showLoader = () => {
    if (pageLoader) pageLoader.classList.remove('d-none')
  }

  const hideLoader = () => {
    if (pageLoader) pageLoader.classList.add('d-none')
  }

  // Hide loader on initial load and back/forward cache restore
  window.addEventListener('pageshow', hideLoader)
  window.addEventListener('DOMContentLoaded', hideLoader)

  // Expose loader functions globally
  window.showLoader = showLoader
  window.hideLoader = hideLoader

  // Fetch all forms with validation
  const forms = document.querySelectorAll('.needs-validation')

  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (form.hasAttribute('data-no-loader') || form.classList.contains('no-loader')) {
        if (!form.checkValidity()) {
          event.preventDefault()
          event.stopPropagation()
        }
        form.classList.add('was-validated')
        return
      }
      if (!form.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
      } else {
        showLoader()
      }
      form.classList.add('was-validated')
    }, false)
  })

  // Show loader on form submission for non-needs-validation forms as well
  const allForms = document.querySelectorAll('form:not(.needs-validation)')
  allForms.forEach(form => {
    form.addEventListener('submit', () => {
      if (form.hasAttribute('data-no-loader') || form.classList.contains('no-loader')) {
        return
      }
      showLoader()
    })
  })

  // Show loader on link navigation
  document.addEventListener('click', e => {
    const link = e.target.closest('a')
    if (link && link.href && !link.href.includes('#') && !link.target && !link.hasAttribute('download') && !link.classList.contains('carousel-control-prev') && !link.classList.contains('carousel-control-next')) {
      const url = new URL(link.href, window.location.href)
      if (url.origin === window.location.origin) {
        showLoader()
      }
    }
  })

  // Live Password Strength Meter
  const passwordInput = document.getElementById('password')
  const strengthBar = document.getElementById('passwordStrengthBar')
  const strengthText = document.getElementById('passwordStrengthText')

  if (passwordInput && strengthBar) {
    passwordInput.addEventListener('input', () => {
      const val = passwordInput.value
      let score = 0

      if (val.length >= 8) score += 25
      if (/[A-Z]/.test(val)) score += 25
      if (/[0-9]/.test(val)) score += 25
      if (/[^A-Za-z0-9]/.test(val)) score += 25

      strengthBar.style.width = score + '%'

      if (score <= 25) {
        strengthBar.className = 'progress-bar bg-danger'
        if (strengthText) strengthText.textContent = 'Weak password (add uppercase, number, symbol)'
      } else if (score <= 50) {
        strengthBar.className = 'progress-bar bg-warning'
        if (strengthText) strengthText.textContent = 'Fair password (add numbers & special characters)'
      } else if (score <= 75) {
        strengthBar.className = 'progress-bar bg-info'
        if (strengthText) strengthText.textContent = 'Good password'
      } else {
        strengthBar.className = 'progress-bar bg-success'
        if (strengthText) strengthText.textContent = 'Strong password!'
      }
    })
  }
})()
