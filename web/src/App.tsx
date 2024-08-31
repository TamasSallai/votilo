import { useLocation, useOutlet } from 'react-router-dom'
import { CSSTransition, SwitchTransition } from 'react-transition-group'
import { routes } from './main'

function App() {
  const currentOutlet = useOutlet()
  const location = useLocation()
  const { nodeRef } =
    routes.find((route) => route.path === location.pathname) ?? {}

  return (
    <div className="h-screen w-full bg-amber-50 text-stone-800 overflow-hidden">
      <SwitchTransition>
        <CSSTransition
          key={location.pathname}
          nodeRef={nodeRef}
          timeout={300}
          classNames="page"
          unmountOnExit
        >
          <div ref={nodeRef} className="page">
            {currentOutlet}
          </div>
        </CSSTransition>
      </SwitchTransition>
    </div>
  )
}

export default App
