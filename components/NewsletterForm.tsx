'use client'

export default function NewsletterForm() {
  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="flex flex-col gap-2"
    >
      <input
        type="email"
        placeholder="seu@email.com"
        className="w-full px-3 py-2 text-sm rounded-md bg-stone-800 border border-stone-700 text-white placeholder-stone-500 focus:outline-none focus:border-orange-500 transition-colors"
      />
      <button
        type="submit"
        className="w-full px-4 py-2 text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white rounded-md transition-colors"
      >
        Quero receber ofertas
      </button>
    </form>
  )
}
