import { createRef, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App.tsx'
import Welcome from './pages/Welcome.tsx'
import CreatePoll from './pages/CreatePoll.tsx'
import JoinPoll from './pages/JoinPoll.tsx'
import './index.css'

export const routes = [
  {
    path: '/',
    name: 'Welcome',
    element: <Welcome />,
    nodeRef: createRef<HTMLDivElement>(),
  },
  {
    path: '/create',
    name: 'Create',
    element: <CreatePoll />,
    nodeRef: createRef<HTMLDivElement>(),
  },
  {
    path: '/join',
    name: 'Join',
    element: <JoinPoll />,
    nodeRef: createRef<HTMLDivElement>(),
  },
]

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: routes.map((route) => ({
      index: route.path === '/',
      path: route.path === '/' ? undefined : route.path,
      element: route.element,
    })),
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
)
