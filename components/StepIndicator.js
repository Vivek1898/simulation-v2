export default function StepIndicator({ steps, currentStep }) {
  return (
    <nav aria-label="Progress">
      <ol className="flex items-center w-full">
        {steps.map((step, stepIdx) => (
          <li key={step.name} className={`relative flex-1 ${stepIdx !== steps.length - 1 ? "pr-8" : ""}`}>
            {step.id < currentStep ? (
              <div className="group">
                <span className="flex items-center">
                  <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 group-hover:bg-blue-800">
                    <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path
                        fillRule="evenodd"
                        d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                  {stepIdx !== steps.length - 1 && (
                    <span className="absolute top-4 left-4 -ml-px h-0.5 w-full bg-blue-600" aria-hidden="true"></span>
                  )}
                </span>
                <span className="mt-2 flex w-full justify-center text-sm font-medium text-gray-900">{step.name}</span>
              </div>
            ) : step.id === currentStep ? (
              <div className="group" aria-current="step">
                <span className="flex items-center">
                  <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-blue-600 bg-white">
                    <span className="h-2.5 w-2.5 rounded-full bg-blue-600"></span>
                  </span>
                  {stepIdx !== steps.length - 1 && (
                    <span className="absolute top-4 left-4 -ml-px h-0.5 w-full bg-gray-300" aria-hidden="true"></span>
                  )}
                </span>
                <span className="mt-2 flex w-full justify-center text-sm font-medium text-blue-600">{step.name}</span>
              </div>
            ) : (
              <div className="group">
                <span className="flex items-center">
                  <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 bg-white group-hover:border-gray-400">
                    <span className="h-2.5 w-2.5 rounded-full bg-transparent group-hover:bg-gray-300"></span>
                  </span>
                  {stepIdx !== steps.length - 1 && (
                    <span className="absolute top-4 left-4 -ml-px h-0.5 w-full bg-gray-300" aria-hidden="true"></span>
                  )}
                </span>
                <span className="mt-2 flex w-full justify-center text-sm font-medium text-gray-500">{step.name}</span>
              </div>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
