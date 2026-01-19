interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepLabels?: string[];
}

export default function StepIndicator({
  currentStep,
  totalSteps,
  stepLabels = [],
}: StepIndicatorProps) {
  return (
    <div className="mb-8">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
          {stepLabels[currentStep - 1] || `Step ${currentStep}`}
        </h1>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Step {currentStep} of {totalSteps}
        </span>
      </div>
      
      {/* Progress Bar */}
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
        <div
          className="h-full rounded-full bg-blue-600 transition-all duration-300 dark:bg-blue-500"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>

      {/* Step Labels */}
      {stepLabels.length > 0 && (
        <div className="mt-4 flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 sm:text-sm">
          {stepLabels.map((label, index) => (
            <div
              key={index}
              className={`flex flex-col items-center ${
                index + 1 <= currentStep ? "text-blue-600 dark:text-blue-400" : ""
              }`}
            >
              <div
                className={`mb-1 flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                  index + 1 < currentStep
                    ? "border-blue-600 bg-blue-600 text-white dark:border-blue-400 dark:bg-blue-400"
                    : index + 1 === currentStep
                    ? "border-blue-600 bg-blue-600 text-white dark:border-blue-400 dark:bg-blue-400"
                    : "border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800"
                }`}
              >
                {index + 1 < currentStep ? "✓" : index + 1}
              </div>
              <span className="hidden text-center sm:block">{label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
