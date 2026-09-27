import {profile} from '@/content/profile';

export default function Footer() {
  return (
    <footer className="relative z-10 px-5 pb-8 pt-24 md:px-10">
      <div className="mx-auto max-w-[1600px]">
        <p
          aria-hidden
          className="select-none whitespace-nowrap text-center font-display text-[16.5vw] font-extrabold uppercase leading-[0.8] tracking-[-0.05em] text-outline"
        >
          {profile.firstName}
        </p>
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-sm text-mist md:flex-row">
          <p>Made with ❤️ by {profile.firstName}.</p>
          <p className="font-mono text-xs uppercase tracking-[0.18em]">
            © {new Date().getFullYear()} {profile.firstName} {profile.lastName}
          </p>
          <a href="#top" className="group inline-flex items-center gap-2 hover:text-acid">
            Back to top
            <span className="transition-transform duration-500 ease-expo group-hover:-translate-y-1" aria-hidden>
              ↑
            </span>
          </a>
        </div>
      </div>
    </footer>
  );
}
