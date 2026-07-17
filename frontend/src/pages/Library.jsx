import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Plus, Pencil, Trash2, RotateCcw, Check, Search, Calendar, DollarSign, User, BookMarked } from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';

export default function Library() {
  const { user } = useAuth();
  const isAdminOrTeacher = user?.role === 'ADMIN' || user?.role === 'TEACHER';

  // State variables
  const [books, setBooks] = useState([]);
  const [issues, setIssues] = useState([]);
  const [myLoans, setMyLoans] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(isAdminOrTeacher ? 'books' : 'browse');

  // Search queries
  const [bookSearch, setBookSearch] = useState('');
  const [issueSearch, setIssueSearch] = useState('');

  // Modals state
  const [bookModalOpen, setBookModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [bookForm, setBookForm] = useState({ title: '', author: '', isbn: '', category: '', copies: 1 });

  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [issueForm, setIssueForm] = useState({ studentId: '', bookId: '', issueDate: new Date().toISOString().split('T')[0], dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] });

  const [saving, setSaving] = useState(false);

  // Fetch initial data
  const fetchData = async () => {
    setLoading(true);
    try {
      if (isAdminOrTeacher) {
        const [booksRes, issuesRes, studentsRes] = await Promise.all([
          apiClient.get('/library/books'),
          apiClient.get('/library/issues'),
          apiClient.get('/students', { params: { page: 0, size: 1000 } })
        ]);
        setBooks(booksRes.data.data || []);
        setIssues(issuesRes.data.data || []);
        setStudents(studentsRes.data.data?.content || []);
      } else {
        const [booksRes, loansRes] = await Promise.all([
          apiClient.get('/library/books'),
          apiClient.get('/library/my-loans')
        ]);
        setBooks(booksRes.data.data || []);
        setMyLoans(loansRes.data.data || []);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load library data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // Book Modal Handlers
  const handleOpenAddBook = () => {
    setBookForm({ title: '', author: '', isbn: '', category: '', copies: 1 });
    setEditingBook(null);
    setBookModalOpen(true);
  };

  const handleOpenEditBook = (book) => {
    setBookForm({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      category: book.category || '',
      copies: book.copies
    });
    setEditingBook(book);
    setBookModalOpen(true);
  };

  const handleSaveBook = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingBook) {
        await apiClient.put(`/library/books/${editingBook.id}`, bookForm);
        toast.success('Book updated successfully');
      } else {
        await apiClient.post('/library/books', bookForm);
        toast.success('Book added successfully');
      }
      setBookModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save book');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBook = async (id) => {
    if (!window.confirm('Are you sure you want to delete this book?')) return;
    try {
      await apiClient.delete(`/library/books/${id}`);
      toast.success('Book deleted successfully');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete book');
    }
  };

  // Issue Book Handlers
  const handleOpenIssueBook = () => {
    setIssueForm({
      studentId: students[0]?.id || '',
      bookId: books.filter(b => b.availableCopies > 0)[0]?.id || '',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
    setIssueModalOpen(true);
  };

  const handleSaveIssue = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiClient.post('/library/issues', {
        ...issueForm,
        studentId: Number(issueForm.studentId),
        bookId: Number(issueForm.bookId)
      });
      toast.success('Book issued successfully');
      setIssueModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to issue book');
    } finally {
      setSaving(false);
    }
  };

  const handleReturnBook = async (id) => {
    if (!window.confirm('Are you sure you want to mark this book as returned?')) return;
    try {
      await apiClient.post(`/library/issues/${id}/return`);
      toast.success('Book marked as returned');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to return book');
    }
  };

  const handleDeleteIssue = async (id) => {
    if (!window.confirm('Are you sure you want to delete this loan record?')) return;
    try {
      await apiClient.delete(`/library/issues/${id}`);
      toast.success('Loan record deleted');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete record');
    }
  };

  // Filter lists based on search
  const filteredBooks = books.filter(b =>
    b.title.toLowerCase().includes(bookSearch.toLowerCase()) ||
    b.author.toLowerCase().includes(bookSearch.toLowerCase()) ||
    b.isbn.toLowerCase().includes(bookSearch.toLowerCase()) ||
    (b.category && b.category.toLowerCase().includes(bookSearch.toLowerCase()))
  );

  const filteredIssues = issues.filter(iss =>
    iss.bookTitle.toLowerCase().includes(issueSearch.toLowerCase()) ||
    iss.studentName.toLowerCase().includes(issueSearch.toLowerCase()) ||
    iss.studentRoll.toLowerCase().includes(issueSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold flex items-center gap-2">
            <BookOpen className="text-indigo-600 dark:text-indigo-400" /> Library Management
          </h1>
          <p className="text-sm text-ink/60 dark:text-paper/60 mt-1">
            {isAdminOrTeacher
              ? 'Catalog new books, track student loans, and calculate overdue fines.'
              : 'Explore the college catalog and track your issued books.'}
          </p>
        </div>

        {isAdminOrTeacher && (
          <div className="flex gap-2">
            <button
              onClick={handleOpenAddBook}
              className="btn btn-secondary flex items-center gap-1.5"
            >
              <Plus size={16} /> Add Book
            </button>
            <button
              onClick={handleOpenIssueBook}
              className="btn btn-primary flex items-center gap-1.5"
            >
              <BookMarked size={16} /> Issue Book
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-ink/10 dark:border-white/10 gap-5">
        {isAdminOrTeacher ? (
          <>
            <button
              onClick={() => setActiveTab('books')}
              className={`pb-3 font-semibold text-sm transition-colors border-b-2 ${
                activeTab === 'books'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                  : 'border-transparent text-ink/60 dark:text-paper/60'
              }`}
            >
              Books Catalog ({books.length})
            </button>
            <button
              onClick={() => setActiveTab('issues')}
              className={`pb-3 font-semibold text-sm transition-colors border-b-2 ${
                activeTab === 'issues'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                  : 'border-transparent text-ink/60 dark:text-paper/60'
              }`}
            >
              Issued Books & Returns ({issues.length})
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setActiveTab('browse')}
              className={`pb-3 font-semibold text-sm transition-colors border-b-2 ${
                activeTab === 'browse'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                  : 'border-transparent text-ink/60 dark:text-paper/60'
              }`}
            >
              Browse Catalog ({books.length})
            </button>
            <button
              onClick={() => setActiveTab('my-loans')}
              className={`pb-3 font-semibold text-sm transition-colors border-b-2 ${
                activeTab === 'my-loans'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                  : 'border-transparent text-ink/60 dark:text-paper/60'
              }`}
            >
              My Loans ({myLoans.length})
            </button>
          </>
        )}
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-ink/60 dark:text-paper/60">Loading library details...</p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* TAB: Books / Browse Catalog */}
          {(activeTab === 'books' || activeTab === 'browse') && (
            <div className="space-y-4">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-2.5 text-ink/40 dark:text-paper/40" size={18} />
                <input
                  type="text"
                  placeholder="Search by title, author, ISBN, category..."
                  value={bookSearch}
                  onChange={(e) => setBookSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-ink/10 dark:border-white/10 rounded-lg bg-transparent focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="overflow-x-auto glass rounded-badge border border-ink/5 dark:border-white/5">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-ink/5 dark:border-white/5 bg-ink/5 dark:bg-white/5 text-ink/75 dark:text-paper/75 font-semibold text-sm">
                      <th className="p-4">Title</th>
                      <th className="p-4">Author</th>
                      <th className="p-4">ISBN</th>
                      <th className="p-4">Category</th>
                      <th className="p-4 text-center">Available Copies</th>
                      <th className="p-4 text-center">Total Copies</th>
                      {isAdminOrTeacher && <th className="p-4 text-right">Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBooks.length === 0 ? (
                      <tr>
                        <td colSpan={isAdminOrTeacher ? 7 : 6} className="p-8 text-center text-ink/50 dark:text-paper/50">
                          No books found in the library catalog.
                        </td>
                      </tr>
                    ) : (
                      filteredBooks.map((book) => (
                        <tr key={book.id} className="border-b border-ink/5 dark:border-white/5 last:border-0 hover:bg-ink/5 dark:hover:bg-white/5 text-sm text-ink/80 dark:text-paper/80">
                          <td className="p-4 font-semibold text-ink dark:text-paper">{book.title}</td>
                          <td className="p-4">{book.author}</td>
                          <td className="p-4 font-mono text-xs">{book.isbn}</td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 text-xs font-medium">
                              {book.category || 'General'}
                            </span>
                          </td>
                          <td className="p-4 text-center font-bold">
                            <span className={book.availableCopies > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                              {book.availableCopies}
                            </span>
                          </td>
                          <td className="p-4 text-center">{book.copies}</td>
                          {isAdminOrTeacher && (
                            <td className="p-4 text-right">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => handleOpenEditBook(book)}
                                  className="p-1.5 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-md"
                                  title="Edit Book"
                                >
                                  <Pencil size={15} />
                                </button>
                                <button
                                  onClick={() => handleDeleteBook(book.id)}
                                  className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950 text-rose-600 dark:text-rose-400 rounded-md"
                                  title="Delete Book"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: Issued Books (Admin / Teacher View) */}
          {activeTab === 'issues' && isAdminOrTeacher && (
            <div className="space-y-4">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-2.5 text-ink/40 dark:text-paper/40" size={18} />
                <input
                  type="text"
                  placeholder="Search by student name, roll number, book..."
                  value={issueSearch}
                  onChange={(e) => setIssueSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-ink/10 dark:border-white/10 rounded-lg bg-transparent focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="overflow-x-auto glass rounded-badge border border-ink/5 dark:border-white/5">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-ink/5 dark:border-white/5 bg-ink/5 dark:bg-white/5 text-ink/75 dark:text-paper/75 font-semibold text-sm">
                      <th className="p-4">Student</th>
                      <th className="p-4">Book Title</th>
                      <th className="p-4">Issue Date</th>
                      <th className="p-4">Due Date</th>
                      <th className="p-4">Return Date</th>
                      <th className="p-4 text-center">Status</th>
                      <th className="p-4 text-right">Fine</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredIssues.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-ink/50 dark:text-paper/50">
                          No active loan records.
                        </td>
                      </tr>
                    ) : (
                      filteredIssues.map((iss) => (
                        <tr key={iss.id} className="border-b border-ink/5 dark:border-white/5 last:border-0 hover:bg-ink/5 dark:hover:bg-white/5 text-sm text-ink/80 dark:text-paper/80">
                          <td className="p-4">
                            <div className="font-semibold text-ink dark:text-paper">{iss.studentName}</div>
                            <div className="text-xs text-ink/50 dark:text-paper/50 font-mono">{iss.studentRoll}</div>
                          </td>
                          <td className="p-4 font-semibold text-ink dark:text-paper">{iss.bookTitle}</td>
                          <td className="p-4">{iss.issueDate}</td>
                          <td className="p-4">{iss.dueDate}</td>
                          <td className="p-4">{iss.returnDate || '—'}</td>
                          <td className="p-4 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold uppercase ${
                              iss.status === 'RETURNED'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : iss.status === 'OVERDUE'
                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 animate-pulse'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            }`}>
                              {iss.status}
                            </span>
                          </td>
                          <td className="p-4 text-right font-bold text-rose-600 dark:text-rose-400">
                            {iss.fine && iss.fine > 0 ? `₹${iss.fine.toFixed(2)}` : '—'}
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end gap-2">
                              {iss.status !== 'RETURNED' && (
                                <button
                                  onClick={() => handleReturnBook(iss.id)}
                                  className="p-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-md"
                                  title="Mark as Returned"
                                >
                                  <Check size={15} />
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteIssue(iss.id)}
                                className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950 text-rose-600 dark:text-rose-400 rounded-md"
                                title="Delete Record"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: My Loans (Student View) */}
          {activeTab === 'my-loans' && !isAdminOrTeacher && (
            <div className="overflow-x-auto glass rounded-badge border border-ink/5 dark:border-white/5">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-ink/5 dark:border-white/5 bg-ink/5 dark:bg-white/5 text-ink/75 dark:text-paper/75 font-semibold text-sm">
                    <th className="p-4">Book Title</th>
                    <th className="p-4">Author</th>
                    <th className="p-4">ISBN</th>
                    <th className="p-4">Issue Date</th>
                    <th className="p-4">Due Date</th>
                    <th className="p-4">Return Date</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-right">Fine</th>
                  </tr>
                </thead>
                <tbody>
                  {myLoans.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-ink/50 dark:text-paper/50">
                        You have no borrowed books.
                      </td>
                    </tr>
                  ) : (
                    myLoans.map((loan) => (
                      <tr key={loan.id} className="border-b border-ink/5 dark:border-white/5 last:border-0 hover:bg-ink/5 dark:hover:bg-white/5 text-sm text-ink/80 dark:text-paper/80">
                        <td className="p-4 font-semibold text-ink dark:text-paper">{loan.bookTitle}</td>
                        <td className="p-4">{loan.bookAuthor}</td>
                        <td className="p-4 font-mono text-xs">{loan.bookIsbn}</td>
                        <td className="p-4">{loan.issueDate}</td>
                        <td className="p-4">{loan.dueDate}</td>
                        <td className="p-4">{loan.returnDate || '—'}</td>
                        <td className="p-4 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold uppercase ${
                            loan.status === 'RETURNED'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : loan.status === 'OVERDUE'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-bold'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}>
                            {loan.status}
                          </span>
                        </td>
                        <td className="p-4 text-right font-bold text-rose-600 dark:text-rose-400">
                          {loan.fine && loan.fine > 0 ? `₹${loan.fine.toFixed(2)}` : '—'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      )}

      {/* Modal: Add/Edit Book */}
      {bookModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md bg-paper dark:bg-zinc-900 border border-ink/10 dark:border-white/10 rounded-badge p-6 shadow-xl text-ink dark:text-paper"
          >
            <h2 className="font-display text-xl font-bold mb-4">{editingBook ? 'Edit Book' : 'Add New Book'}</h2>
            <form onSubmit={handleSaveBook} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1 text-ink/60 dark:text-paper/60">Title *</label>
                <input
                  type="text"
                  required
                  value={bookForm.title}
                  onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
                  className="w-full p-2 border border-ink/10 dark:border-white/10 roundedbg bg-transparent outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-ink/60 dark:text-paper/60">Author *</label>
                <input
                  type="text"
                  required
                  value={bookForm.author}
                  onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })}
                  className="w-full p-2 border border-ink/10 dark:border-white/10 roundedbg bg-transparent outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-ink/60 dark:text-paper/60">ISBN *</label>
                  <input
                    type="text"
                    required
                    value={bookForm.isbn}
                    onChange={(e) => setBookForm({ ...bookForm, isbn: e.target.value })}
                    className="w-full p-2 border border-ink/10 dark:border-white/10 roundedbg bg-transparent outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-ink/60 dark:text-paper/60">Copies *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={bookForm.copies}
                    onChange={(e) => setBookForm({ ...bookForm, copies: Number(e.target.value) })}
                    className="w-full p-2 border border-ink/10 dark:border-white/10 roundedbg bg-transparent outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-ink/60 dark:text-paper/60">Category</label>
                <input
                  type="text"
                  placeholder="e.g. Science, Mathematics, Fiction"
                  value={bookForm.category}
                  onChange={(e) => setBookForm({ ...bookForm, category: e.target.value })}
                  className="w-full p-2 border border-ink/10 dark:border-white/10 roundedbg bg-transparent outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setBookModalOpen(false)}
                  className="btn btn-ghost"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary"
                >
                  {saving ? 'Saving...' : 'Save Book'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Modal: Issue Book */}
      {issueModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md bg-paper dark:bg-zinc-900 border border-ink/10 dark:border-white/10 rounded-badge p-6 shadow-xl text-ink dark:text-paper"
          >
            <h2 className="font-display text-xl font-bold mb-4">Issue Book to Student</h2>
            <form onSubmit={handleSaveIssue} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1 text-ink/60 dark:text-paper/60">Select Student *</label>
                <select
                  required
                  value={issueForm.studentId}
                  onChange={(e) => setIssueForm({ ...issueForm, studentId: e.target.value })}
                  className="w-full p-2 border border-ink/10 dark:border-white/10 roundedbg bg-transparent outline-none focus:ring-2 focus:ring-indigo-500 bg-paper dark:bg-zinc-800"
                >
                  <option value="" disabled>-- Select Student --</option>
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.firstName} {st.lastName} ({st.rollNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-ink/60 dark:text-paper/60">Select Book *</label>
                <select
                  required
                  value={issueForm.bookId}
                  onChange={(e) => setIssueForm({ ...issueForm, bookId: e.target.value })}
                  className="w-full p-2 border border-ink/10 dark:border-white/10 roundedbg bg-transparent outline-none focus:ring-2 focus:ring-indigo-500 bg-paper dark:bg-zinc-800"
                >
                  <option value="" disabled>-- Select Available Book --</option>
                  {books.filter(b => b.availableCopies > 0).map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.title} by {b.author} ({b.availableCopies} left)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-ink/60 dark:text-paper/60">Issue Date *</label>
                  <input
                    type="date"
                    required
                    value={issueForm.issueDate}
                    onChange={(e) => setIssueForm({ ...issueForm, issueDate: e.target.value })}
                    className="w-full p-2 border border-ink/10 dark:border-white/10 roundedbg bg-transparent outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-ink/60 dark:text-paper/60">Due Date *</label>
                  <input
                    type="date"
                    required
                    value={issueForm.dueDate}
                    onChange={(e) => setIssueForm({ ...issueForm, dueDate: e.target.value })}
                    className="w-full p-2 border border-ink/10 dark:border-white/10 roundedbg bg-transparent outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIssueModalOpen(false)}
                  className="btn btn-ghost"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || books.filter(b => b.availableCopies > 0).length === 0}
                  className="btn btn-primary"
                >
                  {saving ? 'Issuing...' : 'Issue Book'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
