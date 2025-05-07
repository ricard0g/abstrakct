import {useRef} from 'react';
import {nanoid} from 'nanoid';

export function useStableIds(count: number) {
  const idsRef = useRef<string[]>([]);

  if (idsRef.current.length !== count) {
    idsRef.current = Array.from({length: count}, () => nanoid());
  }

  return idsRef.current;
}
