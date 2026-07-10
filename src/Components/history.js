function History({ history = [], onBack }) {
  return <div><button type="button" className="backHistory" onClick={onBack}>← Back to latest service</button>{history.length === 0 ? <div className="emptyState"><h3>No history yet</h3><p>Your service visits will appear here after you save them.</p></div> : <div className="historyList">{[...history].reverse().map((item, index) => <article className="historyCard" key={`${item.date}-${index}`}><span className="historyIndex">{history.length - index}</span><div><time>{item.date ? item.date.split("T")[0] : "Date unavailable"}</time><p>{item.serviceDetails || "No service details"}</p></div></article>)}</div>}</div>;
}
export default History;
