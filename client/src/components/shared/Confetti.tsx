import React, { useState } from 'react';
import Confetti from 'react-confetti';

export default function ConfettiComp({
  run,
  path,
  timer,
  count,
  redirect = true,
}: {
  run?: boolean;
  path: string;
  count?: number;
  timer?: number;
  redirect?: boolean;
}) {
  const [confetti, setConfetti] = useState({
    run,
    count: 0,
    firstRun: true,
  });
  if (run && confetti.firstRun) {
    setConfetti({ run: true, count: count ?? 300, firstRun: false });
  }

  if (confetti.run && !confetti.firstRun) {
    if (redirect) {
      setTimeout(() => {
        // router.replace(path, undefined);
      }, timer ?? 500);
    }
    setTimeout(() => {
      setConfetti({ run: true, count: 0, firstRun: true });
    }, 1500);
  }

  return <Confetti run={confetti.run} numberOfPieces={confetti.count} />;
}
