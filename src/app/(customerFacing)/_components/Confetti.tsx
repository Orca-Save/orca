"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Confetti from "react-confetti";

export default function ConfettiComp({
  run,
  path,
}: {
  run?: boolean;
  path: string;
}) {
  const [confetti, setConfetti] = useState({
    run,
    count: 0,
    firstRun: true,
  });
  const router = useRouter();
  if (run && confetti.firstRun) {
    router.replace(path, undefined);
    setConfetti({ run: true, count: 100, firstRun: false });
  }

  if (confetti.run && !confetti.firstRun) {
    setTimeout(() => {
      setConfetti({ run: true, count: 0, firstRun: true });
    }, 1500);
  }
  return <Confetti run={confetti.run} numberOfPieces={confetti.count} />;
}
