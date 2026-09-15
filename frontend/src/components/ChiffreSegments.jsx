const SEGMENTS_PAR_CHIFFRE = {
  0: ['a', 'b', 'c', 'd', 'e', 'f'],
  1: ['b', 'c'],
  2: ['a', 'b', 'g', 'e', 'd'],
  3: ['a', 'b', 'g', 'c', 'd'],
  4: ['f', 'g', 'b', 'c'],
  5: ['a', 'f', 'g', 'c', 'd'],
  6: ['a', 'f', 'g', 'e', 'c', 'd'],
  7: ['a', 'b', 'c'],
  8: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
  9: ['a', 'b', 'c', 'd', 'f', 'g'],
};
const TOUS_SEGMENTS = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
function ChiffreSegments({ valeur }) {
  const actifs = SEGMENTS_PAR_CHIFFRE[valeur] ?? [];
  return (
    <div className="ca-digit">
      {TOUS_SEGMENTS.map((seg) => (
        <div key={seg} className={`ca-segment ca-${seg} ${actifs.includes(seg) ? '' : 'ca-off'}`}></div>
      ))}
    </div>
  );
}
export default ChiffreSegments;