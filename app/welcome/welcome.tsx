import { useEffect } from "react";
import { useNavigate } from "react-router";

export function Welcome() {
  const navitage = useNavigate();
  useEffect(() => {
    navitage("/vacancies");
  }, []);
  return (
    <main className="flex items-center justify-center pt-16 pb-4">
      <div className="flex-1 flex flex-col items-center gap-16 min-h-0">
        <header className="flex flex-col items-center gap-9">
        </header>
        <div className="max-w-[300px] w-full space-y-6 px-4">
          Nothing to see here
        </div>
      </div>
    </main>
  );
}
