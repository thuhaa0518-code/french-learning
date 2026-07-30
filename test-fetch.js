fetch('http://localhost:3000/api/luot-lam/cm02i6j4z000008l412345678/nop', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ cauTraLoi: [] })
})
  .then(async res => {
    console.log('STATUS:', res.status)
    const text = await res.text()
    console.log('TEXT:', text)
  })
  .catch(err => console.error('ERROR:', err))
