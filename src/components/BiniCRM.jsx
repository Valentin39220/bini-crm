import React, { useState, useEffect } from 'react';

const BiniCRM = () => {
  const [view, setView] = useState('dashboard');
  const [prospects, setProspects] = useState([]);
  const [selectedProspect, setSelectedProspect] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [newNote, setNewNote] = useState('');

  const initialProspects = [
    {
      id: 1,
      entreprise: "Tech Solutions",
      contact: "Marie Martin",
      telephone: "06 12 34 56 78",
      email: "marie@techsolutions.fr",
      statut: "qualification",
      temperature: "chaud",
      source: "LinkedIn",
      dateCreation: "2024-01-15",
      dateRelance: "2024-01-20",
      notes: [{ date: "2024-01-15", texte: "Premier contact positif" }],
      montant: 15000
    },
    {
      id: 2,
      entreprise: "Green Energy",
      contact: "Pierre Dubois",
      telephone: "06 98 76 54 32",
      email: "p.dubois@greenenergy.fr",
      statut: "proposition",
      temperature: "tiede",
      source: "Salon",
      dateCreation: "2024-01-10",
      dateRelance: "2024-01-18",
      notes: [{ date: "2024-01-10", texte: "Intéressé par offre premium" }],
      montant: 25000
    },
    {
      id: 3,
      entreprise: "Digital Wave",
      contact: "Sophie Laurent",
      telephone: "06 55 44 33 22",
      email: "sophie@digitalwave.fr",
      statut: "negociation",
      temperature: "chaud",
      source: "Recommandation",
      dateCreation: "2024-01-05",
      dateRelance: "2024-01-22",
      notes: [{ date: "2024-01-05", texte: "Négociation en cours sur le prix" }],
      montant: 35000
    }
  ];

  useEffect(() => {
    const saved = localStorage.getItem('binicrm_prospects');
    if (saved) {
      setProspects(JSON.parse(saved));
    } else {
      setProspects(initialProspects);
    }
  }, []);

  useEffect(() => {
    if (prospects.length > 0) {
      localStorage.setItem('binicrm_prospects', JSON.stringify(prospects));
    }
  }, [prospects]);

  const statuts = [
    { id: 'nouveau', label: 'Nouveau', color: 'bg-gray-500' },
    { id: 'qualification', label: 'Qualification', color: 'bg-blue-500' },
    { id: 'proposition', label: 'Proposition', color: 'bg-yellow-500' },
    { id: 'negociation', label: 'Négociation', color: 'bg-orange-500' },
    { id: 'gagne', label: 'Gagné', color: 'bg-green-500' },
    { id: 'perdu', label: 'Perdu', color: 'bg-red-500' }
  ];

  const temperatures = [
    { id: 'froid', label: 'Froid', color: 'bg-blue-300', emoji: '❄️' },
    { id: 'tiede', label: 'Tiède', color: 'bg-yellow-300', emoji: '🌤️' },
    { id: 'chaud', label: 'Chaud', color: 'bg-red-400', emoji: '🔥' }
  ];

  const getStatutInfo = (statutId) => statuts.find(s => s.id === statutId) || statuts[0];
  const getTempInfo = (tempId) => temperatures.find(t => t.id === tempId) || temperatures[0];

  const isRelanceUrgente = (date) => {
    if (!date) return false;
    const today = new Date();
    const relance = new Date(date);
    return relance <= today;
  };

  const isRelanceAujourdhui = (date) => {
    if (!date) return false;
    const today = new Date().toDateString();
    const relance = new Date(date).toDateString();
    return today === relance;
  };

  const filteredProspects = prospects.filter(p => {
    const matchSearch = p.entreprise.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       p.contact.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'all' || p.statut === filterStatus;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: prospects.length,
    chauds: prospects.filter(p => p.temperature === 'chaud').length,
    relancesUrgentes: prospects.filter(p => isRelanceUrgente(p.dateRelance) && !['gagne', 'perdu'].includes(p.statut)).length,
    montantPipeline: prospects.filter(p => !['gagne', 'perdu'].includes(p.statut)).reduce((sum, p) => sum + (p.montant || 0), 0),
    gagnes: prospects.filter(p => p.statut === 'gagne').length
  };

  const [formData, setFormData] = useState({
    entreprise: '', contact: '', telephone: '', email: '',
    statut: 'nouveau', temperature: 'tiede', source: '',
    dateRelance: '', montant: '', notes: []
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.id) {
      setProspects(prospects.map(p => p.id === formData.id ? { ...formData, montant: Number(formData.montant) } : p));
    } else {
      const newProspect = {
        ...formData,
        id: Date.now(),
        dateCreation: new Date().toISOString().split('T')[0],
        montant: Number(formData.montant),
        notes: []
      };
      setProspects([...prospects, newProspect]);
    }
    setShowForm(false);
    setFormData({ entreprise: '', contact: '', telephone: '', email: '', statut: 'nouveau', temperature: 'tiede', source: '', dateRelance: '', montant: '', notes: [] });
  };

  const handleEdit = (prospect) => {
    setFormData(prospect);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (confirm('Supprimer ce prospect ?')) {
      setProspects(prospects.filter(p => p.id !== id));
      setSelectedProspect(null);
    }
  };

  const updateStatut = (id, newStatut) => {
    setProspects(prospects.map(p => p.id === id ? { ...p, statut: newStatut } : p));
    if (selectedProspect?.id === id) {
      setSelectedProspect({ ...selectedProspect, statut: newStatut });
    }
  };

  const addNote = (id) => {
    if (!newNote.trim()) return;
    const note = { date: new Date().toISOString().split('T')[0], texte: newNote };
    setProspects(prospects.map(p => p.id === id ? { ...p, notes: [...(p.notes || []), note] } : p));
    if (selectedProspect?.id === id) {
      setSelectedProspect({ ...selectedProspect, notes: [...(selectedProspect.notes || []), note] });
    }
    setNewNote('');
  };

  const exportCSV = () => {
    const headers = ['Entreprise', 'Contact', 'Téléphone', 'Email', 'Statut', 'Température', 'Source', 'Montant', 'Date Relance'];
    const rows = prospects.map(p => [p.entreprise, p.contact, p.telephone, p.email, p.statut, p.temperature, p.source, p.montant, p.dateRelance]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'prospects_bini.csv';
    a.click();
  };

  const ProspectCard = ({ prospect, onClick }) => {
    const statutInfo = getStatutInfo(prospect.statut);
    const tempInfo = getTempInfo(prospect.temperature);
    const urgent = isRelanceUrgente(prospect.dateRelance) && !['gagne', 'perdu'].includes(prospect.statut);
    const aujourdhui = isRelanceAujourdhui(prospect.dateRelance);

    return (
      <div
        onClick={() => onClick(prospect)}
        className={`bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-lg transition-all border-l-4 ${urgent ? 'border-red-500' : aujourdhui ? 'border-yellow-500' : 'border-transparent'}`}
      >
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-gray-800">{prospect.entreprise}</h3>
          <span className="text-lg">{tempInfo.emoji}</span>
        </div>
        <p className="text-sm text-gray-600 mb-2">{prospect.contact}</p>
        <div className="flex gap-2 flex-wrap">
          <span className={`text-xs px-2 py-1 rounded text-white ${statutInfo.color}`}>
            {statutInfo.label}
          </span>
          {prospect.montant > 0 && (
            <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">
              {prospect.montant.toLocaleString()}€
            </span>
          )}
        </div>
        {urgent && (
          <p className="text-xs text-red-500 mt-2 font-medium">⚠️ Relance en retard</p>
        )}
        {aujourdhui && !urgent && (
          <p className="text-xs text-yellow-600 mt-2 font-medium">📅 Relance aujourd'hui</p>
        )}
      </div>
    );
  };

  const Dashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-500 text-sm">Total prospects</p>
          <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-500 text-sm">Prospects chauds 🔥</p>
          <p className="text-3xl font-bold text-red-500">{stats.chauds}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-500 text-sm">Relances urgentes</p>
          <p className="text-3xl font-bold text-orange-500">{stats.relancesUrgentes}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-500 text-sm">Pipeline</p>
          <p className="text-3xl font-bold text-green-600">{stats.montantPipeline.toLocaleString()}€</p>
        </div>
      </div>

      {stats.relancesUrgentes > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-bold text-red-800 mb-3">🚨 Relances urgentes</h3>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {prospects
              .filter(p => isRelanceUrgente(p.dateRelance) && !['gagne', 'perdu'].includes(p.statut))
              .map(p => (
                <ProspectCard key={p.id} prospect={p} onClick={setSelectedProspect} />
              ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="font-bold text-gray-800 mb-3">Prospects chauds 🔥</h3>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {prospects
            .filter(p => p.temperature === 'chaud' && !['gagne', 'perdu'].includes(p.statut))
            .map(p => (
              <ProspectCard key={p.id} prospect={p} onClick={setSelectedProspect} />
            ))}
        </div>
      </div>
    </div>
  );

  const ListView = () => (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-3">
        <input
          type="text"
          placeholder="Rechercher..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="all">Tous les statuts</option>
          {statuts.map(s => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </select>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {filteredProspects.map(p => (
          <ProspectCard key={p.id} prospect={p} onClick={setSelectedProspect} />
        ))}
      </div>

      {filteredProspects.length === 0 && (
        <p className="text-center text-gray-500 py-8">Aucun prospect trouvé</p>
      )}
    </div>
  );

  const PipelineView = () => (
    <div className="overflow-x-auto">
      <div className="flex gap-4 min-w-max pb-4">
        {statuts.filter(s => !['gagne', 'perdu'].includes(s.id)).map(statut => (
          <div key={statut.id} className="w-72 flex-shrink-0">
            <div className={`${statut.color} text-white px-3 py-2 rounded-t-lg font-medium`}>
              {statut.label} ({prospects.filter(p => p.statut === statut.id).length})
            </div>
            <div className="bg-gray-100 rounded-b-lg p-2 min-h-96 space-y-2">
              {prospects
                .filter(p => p.statut === statut.id)
                .map(p => (
                  <ProspectCard key={p.id} prospect={p} onClick={setSelectedProspect} />
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const ProspectDetail = () => {
    if (!selectedProspect) return null;
    const statutInfo = getStatutInfo(selectedProspect.statut);
    const tempInfo = getTempInfo(selectedProspect.temperature);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-screen overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{selectedProspect.entreprise}</h2>
                <p className="text-gray-600">{selectedProspect.contact}</p>
              </div>
              <button onClick={() => setSelectedProspect(null)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>

            <div className="flex gap-2 mb-4">
              <span className={`px-3 py-1 rounded text-white ${statutInfo.color}`}>{statutInfo.label}</span>
              <span className={`px-3 py-1 rounded ${tempInfo.color}`}>{tempInfo.emoji} {tempInfo.label}</span>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-500">Téléphone</p>
                <a href={`tel:${selectedProspect.telephone}`} className="text-blue-600 hover:underline font-medium">
                  📞 {selectedProspect.telephone}
                </a>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <a href={`mailto:${selectedProspect.email}`} className="text-blue-600 hover:underline">
                  {selectedProspect.email}
                </a>
              </div>
              <div>
                <p className="text-sm text-gray-500">Source</p>
                <p className="font-medium">{selectedProspect.source || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Montant estimé</p>
                <p className="font-medium">{selectedProspect.montant?.toLocaleString() || 0}€</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date création</p>
                <p className="font-medium">{selectedProspect.dateCreation}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Prochaine relance</p>
                <p className={`font-medium ${isRelanceUrgente(selectedProspect.dateRelance) ? 'text-red-500' : ''}`}>
                  {selectedProspect.dateRelance || '-'}
                </p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-500 mb-2">Changer le statut</p>
              <div className="flex flex-wrap gap-2">
                {statuts.map(s => (
                  <button
                    key={s.id}
                    onClick={() => updateStatut(selectedProspect.id, s.id)}
                    className={`px-3 py-1 rounded text-sm ${selectedProspect.statut === s.id ? `${s.color} text-white` : 'bg-gray-200 hover:bg-gray-300'}`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-500 mb-2">Notes</p>
              <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
                {(selectedProspect.notes || []).map((note, i) => (
                  <div key={i} className="bg-gray-50 p-2 rounded text-sm">
                    <span className="text-gray-400">{note.date}</span> - {note.texte}
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Ajouter une note..."
                  className="flex-1 px-3 py-2 border rounded-lg text-sm"
                  onKeyPress={(e) => e.key === 'Enter' && addNote(selectedProspect.id)}
                />
                <button
                  onClick={() => addNote(selectedProspect.id)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                >
                  Ajouter
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => { handleEdit(selectedProspect); setSelectedProspect(null); }}
                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                ✏️ Modifier
              </button>
              <button
                onClick={() => handleDelete(selectedProspect.id)}
                className="px-4 py-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg"
              >
                🗑️ Supprimer
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const FormModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-screen overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">{formData.id ? 'Modifier' : 'Nouveau'} prospect</h2>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Entreprise *</label>
              <input
                type="text"
                required
                value={formData.entreprise}
                onChange={(e) => setFormData({ ...formData, entreprise: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Contact *</label>
              <input
                type="text"
                required
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Téléphone</label>
                <input
                  type="tel"
                  value={formData.telephone}
                  onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Statut</label>
                <select
                  value={formData.statut}
                  onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  {statuts.map(s => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Température</label>
                <select
                  value={formData.temperature}
                  onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  {temperatures.map(t => (
                    <option key={t.id} value={t.id}>{t.emoji} {t.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Source</label>
                <input
                  type="text"
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="LinkedIn, Salon..."
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Montant estimé (€)</label>
                <input
                  type="number"
                  value={formData.montant}
                  onChange={(e) => setFormData({ ...formData, montant: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Date de relance</label>
              <input
                type="date"
                value={formData.dateRelance}
                onChange={(e) => setFormData({ ...formData, dateRelance: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
            >
              {formData.id ? 'Enregistrer' : 'Créer le prospect'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-blue-600">BINI CRM</h1>
            <div className="flex gap-2">
              <button
                onClick={exportCSV}
                className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                📥 Export
              </button>
              <button
                onClick={() => setShowForm(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-medium"
              >
                + Nouveau
              </button>
            </div>
          </div>
        </div>
      </header>

      <nav className="bg-white border-b sticky top-14 z-30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-4">
            {[
              { id: 'dashboard', label: '📊 Dashboard' },
              { id: 'liste', label: '📋 Liste' },
              { id: 'pipeline', label: '🎯 Pipeline' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setView(tab.id)}
                className={`py-3 px-2 text-sm font-medium border-b-2 transition-colors ${
                  view === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {view === 'dashboard' && <Dashboard />}
        {view === 'liste' && <ListView />}
        {view === 'pipeline' && <PipelineView />}
      </main>

      {selectedProspect && <ProspectDetail />}
      {showForm && <FormModal />}
    </div>
  );
};

export default BiniCRM;
