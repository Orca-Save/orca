import { useState } from 'react';
import Confetti from 'react-confetti';
import { useLocation, useNavigate } from 'react-router-dom';

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
  const location = useLocation();
  const navigate = useNavigate();
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
        const currentPath = location.pathname;
        navigate(currentPath, { replace: true });
      }, timer ?? 500);
    }
    setTimeout(() => {
      setConfetti({ run: true, count: 0, firstRun: true });
    }, 1500);
  }

  return <Confetti run={confetti.run} numberOfPieces={confetti.count} />;
}
