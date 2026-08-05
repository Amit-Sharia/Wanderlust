// Example starter JavaScript for disabling form submissions if there are invalid fields
(() => {
  'use strict'

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll('.needs-validation')

  // Loop over them and prevent submission
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
      }

      form.classList.add('was-validated')
    }, false)
  })

  const taxToggleBtn = document.getElementById('taxToggleBtn')

  if (taxToggleBtn) {
    taxToggleBtn.addEventListener('click', () => {
      const afterTaxLabels = document.querySelectorAll('.listing-price-after-tax')
      const isVisible = taxToggleBtn.dataset.visible === 'true'
      taxToggleBtn.dataset.visible = isVisible ? 'false' : 'true'
      taxToggleBtn.textContent = isVisible ? 'Show amount after tax' : 'Hide amount after tax'

      afterTaxLabels.forEach(label => {
        label.classList.toggle('visible', !isVisible)
      })
    })
  }
})()