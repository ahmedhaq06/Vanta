export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black py-10 text-center text-sm text-gray-400">
      <div className="mx-auto max-w-6xl px-4">
        © {new Date().getFullYear()} Vanta. All rights reserved.
      </div>
    </footer>
  );
}
