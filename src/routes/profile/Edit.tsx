import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import ProfileForm from "../../components/ProfileForm";

export default function ProfileEditPage() {
  const { user } = useAuth();

  // Wrapped in <RequireAuth> in App.tsx, so `user` is non-null here once loading
  // finished. The backend has no endpoint exposing phone/avatar/createdAt yet
  // (only /api/user/update to set them), so those fields start blank/unknown —
  // ProfileForm falls back gracefully (blank avatar → initials, unknown date → "—").
  const initialUser = {
    email: user?.email ?? "",
    role: user?.role ?? "user",
    username: user?.name ?? "",
    phone: "",
    profilePicture: "",
    createdAt: "",
  };

  return (
    <div className="py-8">
      <Link to="/profile" className="inline-flex items-center gap-1 text-sm font-medium text-neutral-500 hover:text-[#1f2937] mb-6">
        <ChevronLeft size={16} /> Back to account
      </Link>
      <ProfileForm initialUser={initialUser} />
    </div>
  );
}
