const AuthFormField = ({
  id,
  label,
  type = 'text',
  placeholder,
  error,
  registration,
  autoComplete,
}) => (
  <div className="space-y-1.5">
    <label
      htmlFor={id}
      className="block text-[13px] font-medium text-slate-700 dark:text-slate-300"
    >
      {label}
    </label>
    <input
      id={id}
      type={type}
      autoComplete={autoComplete}
      placeholder={placeholder}
      className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-0 dark:bg-neutral-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:ring-offset-neutral-900 ${
        error
          ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20 dark:border-red-800'
          : 'border-slate-200 hover:border-slate-300 focus:border-slate-400 focus:ring-slate-900/10 dark:border-neutral-700 dark:hover:border-neutral-600 dark:focus:border-neutral-500 dark:focus:ring-white/10'
      }`}
      {...registration}
    />
    {error && (
      <p className="text-[13px] text-red-600 dark:text-red-400" role="alert">
        {error}
      </p>
    )}
  </div>
);

export default AuthFormField;
