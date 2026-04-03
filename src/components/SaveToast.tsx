interface SaveToastProps {
  visible: boolean;
}

export default function SaveToast({ visible }: SaveToastProps) {
  if (!visible) return null;

  return (
    <div className="save-toast" role="status" aria-label="File saved">
      Saved
    </div>
  );
}
