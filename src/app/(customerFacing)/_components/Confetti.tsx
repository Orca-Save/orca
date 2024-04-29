"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Confetti from "react-confetti";

export default function ConfettiComp() {
  const [confetti, setConfetti] = useState({
    run: false,
    count: 0,
    firstRun: true,
  });
  const router = useRouter();
  const searchParams = new URLSearchParams(window.location.search);
  if (searchParams.has("confetti") && confetti.firstRun) {
    router.replace(window.location.pathname, undefined);
    setConfetti({ run: true, count: 100, firstRun: false });
  }

  if (confetti.run && !confetti.firstRun) {
    setTimeout(() => {
      setConfetti({ run: false, count: 0, firstRun: true });
    }, 1500);
  }
  return <Confetti run={confetti.run} numberOfPieces={confetti.count} />;
}
