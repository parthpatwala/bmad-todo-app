import { TodoPage } from './components/todo-page'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900">bmad-todo-app</h1>
        <p className="mt-2 mb-6 text-gray-600">Manage your tasks.</p>
        <TodoPage />
      </div>
    </div>
  )
}

export default App
