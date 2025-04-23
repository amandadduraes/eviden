import React, { useState, useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";

export default function App() {
  const [bookmarks, setBookmarks] = useState([]);
  const [abaSelecionada, setAbaSelecionada] = useState("todos");
  
  const [form, setForm] = useState({
    title: "",
    url: "",
    remember_date: ""
  });
  const [loading, setLoading] = useState(true);
  const API_URL = "http://localhost:5000/bookmarks"; // Troque de acordo com a sua rota do backend

  const isToday = (dateStr) => {
    const today = new Date();
    const localDate = today.toISOString().slice(0, 10);
  
    const offset = today.getTimezoneOffset();
    const adjustedDate = new Date(today.getTime() - offset * 60 * 1000)
      .toISOString()
      .slice(0, 10);
  
    return dateStr === adjustedDate;
  };
  

  const isValidURL = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const fetchBookmarks = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      const sorted = data.sort((a, b) => a.remember_date.localeCompare(b.remember_date));
      setBookmarks(sorted);
    } catch {
      toast.error("Erro ao carregar os bookmarks.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValidURL(form.url)) {
      toast.error("URL inválida!");
      return;
    }

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

        if (res.ok) {
          await fetchBookmarks();
          setForm({ title: "", url: "", remember_date: "" });
          toast.success(`📚 ${form.title} salvo com sucesso!`);
        } else {
          toast.error("Erro ao salvar livro.");
        }
      } catch {
        toast.error("Erro de comunicação com o backend.");
      }
    };

  const handleDelete = async (title) => {
    const encodedTitle = encodeURIComponent(title);
    try {
      const res = await fetch(`${API_URL}/${encodedTitle}`, {
        method: "DELETE"
      });

      if (res.ok) {
        await fetchBookmarks();
      } else {
        toast.error("Erro ao excluir.");
      }
    } catch {
      toast.error("Erro de rede.");
    }
  };

  const bookmarksFiltrados = abaSelecionada === "hoje"
  ? bookmarks.filter(b => isToday(b.remember_date))
  : bookmarks;

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-6 text-center text-blue-700">
            📚 Livraria Eviden
          </h1>

          <div className="flex justify-center mb-4 space-x-4">
  <button
    onClick={() => setAbaSelecionada("todos")}
    className={`px-4 py-2 rounded ${
      abaSelecionada === "todos"
        ? "bg-blue-600 text-white"
        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
    }`}
  >
    Todos
  </button>
  <button
    onClick={() => setAbaSelecionada("hoje")}
    className={`px-4 py-2 rounded ${
      abaSelecionada === "hoje"
        ? "bg-blue-600 text-white"
        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
    }`}
  >
    Hoje
  </button>
</div>


<form onSubmit={handleSubmit} className="mb-6 space-y-4">
  <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0 w-full">
    <input
      name="title"
      placeholder="Título"
      value={form.title}
      onChange={handleChange}
      required
      className="flex-1 p-2 border rounded-md bg-blue-50"
    />
    <input
      name="url"
      placeholder="URL"
      value={form.url}
      onChange={handleChange}
      required
      className="flex-1 p-2 border rounded-md bg-blue-50"
    />
    <input
      name="remember_date"
      type="date"
      value={form.remember_date}
      onChange={handleChange}
      required
      className="p-2 border rounded-md"
    />
  </div>

  <div className="flex justify-center space-x-4">
    <button
      type="submit"
      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
    >
      Salvar
    </button>
    <button
      type="button"
      onClick={() => setForm({ title: "", url: "", remember_date: "" })}
      className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-700"
    >
      Limpar
    </button>
  </div>
</form>


          {loading ? (
            <p className="text-center text-gray-500">🔄 Carregando...</p>
          ) : (
            <ul className="space-y-4">
              {bookmarksFiltrados.map((b, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between border-b pb-2"
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={`https://www.google.com/s2/favicons?domain=${new URL(b.url).hostname}`}
                      alt="favicon"
                      className="w-5 h-5"
                    />
                    <div>
                      <a
                        href={b.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-blue-700 hover:underline"
                      >
                        {b.title}
                      </a>
                      <div className="text-sm text-gray-600">
                        {new Date(b.remember_date).toLocaleDateString("pt-BR")}{" "}
                        {isToday(b.remember_date) && (
                          <span className="text-green-600 font-medium">(hoje!)</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(b.title)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
                  >
                    Excluir
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
