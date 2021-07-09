import { useState } from 'react';

export default function ContactForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  const [isSuccess, setIsSuccess] = useState(-1)
  // const [resSuccess, setResSuccess] = useState('')
  // const [message, setMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      name,
      email,
      message,
      submit: "Submit"
    }

    const contactRes = await fetch('/api/contact', {
      method: 'post',
      body: JSON.stringify(data),
    })

    const resJson = await contactRes.json()

    if (resJson.status == 'mail_sent') {
      setIsSuccess(1)

      setTimeout(() => {
        setName('')
        setEmail('')
        setMessage('')
        setIsSuccess(-1)
      }, 30000)
    }

    if (resJson.status == 'validation_failed') {
      setIsSuccess(0)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label htmlFor="name" className="block mb-1">Name</label>
        <input
          className="block w-full border-2 border-gray-400 rounded-md px-4 py-2 text-gray-700"
          id="name"
          type="text"
          onChange={e => setName(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <label htmlFor="email" className="block mb-1">Email</label>
        <input
          className="block w-full border-2 border-gray-400 rounded-md px-4 py-2 text-gray-700"
          id="email"
          type="email"
          onChange={e => setEmail(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <label htmlFor="message" className="block mb-1">Message</label>
        <textarea
          className="block w-full border-2 border-gray-400 rounded-md px-4 py-2 text-gray-700"
          id="message"
          type="text"
          rows="4"
          onChange={e => setMessage(e.target.value)}
        />
      </div>
      { (isSuccess == 1) &&
        <div className="px-4 py-2 text-xl bg-green-200 text-green-800 rounded-sm mb-4 transition-all duration-500">
          Thank you for your message. It has been sent.
        </div>
      }

      { (isSuccess == 0) &&
        <div className="px-4 py-2 text-xl bg-red-400 text-white rounded-sm mb-4 transition-all duration-500">
          One or more fields have an error. Please check and try again.
        </div>
      }
      <div>
        <button className="px-4 py-2 text-xl bg-blue-600 text-white rounded-lg hover:bg-blue-400" 
          type="submit">
            Submit Inquiry
        </button>
      </div>
    </form>
  );
}