import { useSelector } from "react-redux";
import "../css/loader.css";

export default function Loader() {
  const isLoading = useSelector((state) => state.loader.isLoading);

  if (!isLoading) return null;

  return (
    <div className="loader-overlay">
      <div className="loader-spinner"></div>
    </div>
  );
}
