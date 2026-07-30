fetch('http://localhost:3000/api/luot-lam', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ exam_id: 'exam-video-seed-3' })
})
  .then(async res => {
    console.log('STATUS:', res.status)
    const text = await res.text()
    console.log('TEXT:', text)
  })
  .catch(err => console.error('ERROR:', err))
