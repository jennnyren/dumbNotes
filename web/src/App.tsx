import './App.css'

import { useEffect, useState } from "react";

type Note = { id: string; title: string; content: string; updatedAt: string };

const API = "http://localhost:3000";
const HEADERS = { "x-user-id": "demo-user" };

export default function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [draft, setDraft] = useState({ title: "", content: "" });
  const [editing, setEditing] = useState<null | string>(null);

  const load = async () => {
    const r = await fetch(`${API}/api/notes`, { headers: HEADERS });
    setNotes(await r.json());
  };
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!draft.title.trim() && !draft.content.trim()) return;
    await fetch(`${API}/api/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...HEADERS },
      body: JSON.stringify(draft)
    });
    setDraft({ title: "", content: "" });
    load();
  };

  const update = async (id: string, patch: Partial<Note>) => {
    await fetch(`${API}/api/notes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...HEADERS },
      body: JSON.stringify(patch)
    });
    setEditing(null);
    load();
  };

  const remove = async (id: string) => {
    await fetch(`${API}/api/notes/${id}`, { method: "DELETE", headers: HEADERS });
    load();
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold">Notes</h1>

      <div className="grid gap-3 border rounded-2xl p-4">
        <input
          className="border p-2 rounded"
          placeholder="Title"
          value={draft.title}
          onChange={e=>setDraft(d=>({ ...d, title: e.target.value }))}
        />
        <textarea
          className="border p-2 rounded h-32"
          placeholder="Write…"
          value={draft.content}
          onChange={e=>setDraft(d=>({ ...d, content: e.target.value }))}
        />
        <button
          className="bg-black text-white rounded px-4 py-2 w-fit"
          onClick={create}
        >
          Save
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {notes.map(n => (
          <div key={n.id} className="border rounded-2xl p-4 space-y-2">
            {editing === n.id ? (
              <Editor
                note={n}
                onCancel={()=>setEditing(null)}
                onSave={(title, content)=>update(n.id, { title, content })}
              />
            ) : (
              <>
                <div className="flex justify-between items-start gap-2">
                  <div className="font-semibold">{n.title || "(untitled)"}</div>
                  <div className="text-xs opacity-60">{new Date(n.updatedAt).toLocaleString()}</div>
                </div>
                <p className="text-sm whitespace-pre-wrap">{n.content}</p>
                <div className="flex gap-2 pt-2">
                  <button className="text-sm underline" onClick={()=>setEditing(n.id)}>Edit</button>
                  <button className="text-sm underline" onClick={()=>remove(n.id)}>Delete</button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function Editor({ note, onCancel, onSave }:{
  note: Note, onCancel: ()=>void, onSave: (t:string,c:string)=>void
}) {
  const [t, setT] = useState(note.title);
  const [c, setC] = useState(note.content);
  return (
    <div className="grid gap-2">
      <input className="border p-2 rounded" value={t} onChange={e=>setT(e.target.value)} />
      <textarea className="border p-2 rounded h-24" value={c} onChange={e=>setC(e.target.value)} />
      <div className="flex gap-2">
        <button className="bg-black text-white rounded px-3 py-1" onClick={()=>onSave(t,c)}>Save</button>
        <button className="rounded px-3 py-1 border" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}
