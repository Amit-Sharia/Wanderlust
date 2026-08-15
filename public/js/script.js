(() => {
  'use strict'

  // Fetch all forms with validation
  const forms = document.querySelectorAll('.needs-validation')

  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
      }
      form.classList.add('was-validated')
    }, false)
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