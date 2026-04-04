import { useAppContext } from '../context/AppContext';

export default function Toast() {
  const { toast } = useAppContext();

  return (
    <div id="toast" className={toast.visible ? 'show' : ''}>
      {toast.message}
    </div>
  );
}
