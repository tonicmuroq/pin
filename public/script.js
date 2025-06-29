function randomSubtleGradient() {
  const gradients = [
    'linear-gradient(90deg, #659999, #7a8d89, #f4791f)',
    'linear-gradient(90deg, #22c1c3, #fdbb2d)',
    'linear-gradient(90deg, #a1c4fd, #c2e9fb)',
    'linear-gradient(90deg, #e0c3fc, #8ec5fc)',
    'linear-gradient(90deg, #e6e9f0, #eef1f5)'
  ];
  return gradients[Math.floor(Math.random() * gradients.length)];
}

const { useState, useEffect } = React;

function App() {
  const [pins, setPins] = useState([]);
  const [phrase, setPhrase] = useState('');
  const [emoji, setEmoji] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const emojis = ['😀', '😎', '😢', '😡', '🎉', '❤️', '👍', '🚀'];

  async function fetchPins() {
    const res = await fetch('/api/pins');
    if (res.ok) setPins(await res.json());
  }

  useEffect(() => {
    document.body.style.background = randomSubtleGradient();
    fetchPins();
  }, []);

  async function addPin(e) {
    e.preventDefault();
    if (!phrase.trim()) return;
    const params = new URLSearchParams();
    params.append('phrase', phrase.trim());
    if (emoji) params.append('emoji', emoji);
    await fetch('/api/pin', { method: 'POST', body: params });
    setPhrase('');
    setEmoji('');
    setPickerOpen(false);
    await fetchPins();
  }

  async function inc(id) {
    await fetch(`/api/pin/${id}`, { method: 'POST' });
    await fetchPins();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4 text-center">pin</h1>
      <form onSubmit={addPin} className="mb-4 flex items-center space-x-2">
        <button
          type="button"
          id="emoji-btn"
          className="px-2 py-1 bg-gray-200 rounded"
          onClick={() => setPickerOpen(!pickerOpen)}
        >
          {emoji || '+'}
        </button>
        {pickerOpen && (
          <div id="emoji-picker" className="mb-2 flex flex-wrap gap-2">
            {emojis.map((em) => (
              <button
                key={em}
                type="button"
                className="p-2 text-xl"
                onClick={() => {
                  setEmoji(em);
                  setPickerOpen(false);
                }}
              >
                {em}
              </button>
            ))}
          </div>
        )}
        <input
          type="text"
          value={phrase}
          onChange={(e) => setPhrase(e.target.value)}
          required
          className="flex-grow p-2 border rounded"
          placeholder="Say something"
        />
        <button
          type="submit"
          className="px-4 text-white rounded"
          style={{ background: randomSubtleGradient() }}
        >
          Pin
        </button>
      </form>
      <ul id="pin-list">
        {pins.map((item) => (
          <li key={item.id} className="my-2">
            <a
              href="#"
              className="block p-4 bg-gray-100 rounded pin-link"
              onClick={(e) => {
                e.preventDefault();
                inc(item.id);
              }}
            >
              {item.emoji && <span className="mr-2">{item.emoji}</span>}
              {item.phrase + ' '}
              <span className="text-sm text-gray-500">({item.count})</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
