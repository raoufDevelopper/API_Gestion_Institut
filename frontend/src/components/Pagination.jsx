function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  return (
    <div className="pagination">
      <a onClick={() => page > 1 && onChange(page - 1)} style={{ cursor: page > 1 ? 'pointer' : 'default', opacity: page > 1 ? 1 : 0.4 }}>←</a>
      {pages.map((p) => (
        <span
          key={p}
          className={p === page ? 'current' : ''}
          onClick={() => onChange(p)}
          style={{ cursor: 'pointer' }}
        >
          {p}
        </span>
      ))}
      <a onClick={() => page < totalPages && onChange(page + 1)} style={{ cursor: page < totalPages ? 'pointer' : 'default', opacity: page < totalPages ? 1 : 0.4 }}>→</a>
    </div>
  );
}
export default Pagination;