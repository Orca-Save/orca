'use client';
import { softSync } from '@/app/_actions/plaid';
import { Button } from 'antd';
import { useState } from 'react';

export default function AdminButtons() {
  const [state, setState] = useState({ pass: '' });
  return (
    <>
      {/* <input
        name='pass'
        id='pass'
        type='text'
        value={state.pass}
        onChange={(e) =>
          setState({ ...state, [e.target.name]: e.target.value })
        }
      />
      <Button
        onClick={async () =>
          console.log('hash', await hashPassword(state.pass))
        }
      >
        pass
      </Button> */}
      <Button onClick={async () => await softSync()}>Soft Sync</Button>
    </>
  );
}
