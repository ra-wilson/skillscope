// Profile page providing user profile management, institution selection, and skill tracking
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, collection, getDocs, updateDoc, serverTimestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { UserCircle, Building, Plus } from "lucide-react";
import SkillsSelector from '@/components/SkillSelector';
import { Select, SelectTrigger, SelectContent, SelectItem } from '@/components/ui/select';

// Defines Firestore skill document structure
interface SkillDoc {
  name: string;
  level: number;
  category?: string;
  updatedAt?: any;
}

// Component rendering user profile page, handling institution updates and skill management
const ProfilePage = () => {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<any>(null);
  const [skills, setSkills] = useState<SkillDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [institutions, setInstitutions] = useState<{ id: string; name: string }[]>([]);
  const [selectedInstitutionId, setSelectedInstitutionId] = useState<string>('');
  const [hasInstitution, setHasInstitution] = useState<boolean>(false);

  // Fetch user profile and skills from Firestore on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!auth.currentUser) {
          setLoading(false);
          return;
        }
        const uid = auth.currentUser.uid;
        const userDocRef = doc(db, "users", uid);
        const userSnap = await getDoc(userDocRef);

        if (userSnap.exists()) {
          setProfileData(userSnap.data());
        }

        const skillsRef = collection(db, "users", uid, "skills");
        const skillsSnap = await getDocs(skillsRef);
        const skillList: SkillDoc[] = [];
        skillsSnap.forEach((doc) => {
          const data = doc.data() as SkillDoc;
          skillList.push({ ...data, name: doc.id });
        });
        setSkills(skillList);
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Initialise institution selection state for individual users
  useEffect(() => {
    if (profileData && profileData.role === 'individual') {
      if (profileData.institutionId) {
        setHasInstitution(true);
        setSelectedInstitutionId(profileData.institutionId);
      }
    }
  }, [profileData]);

  // Load available institutions from Firestore for selection
  useEffect(() => {
    const loadInstitutions = async () => {
      const instRef = collection(db, 'institutions');
      const snap = await getDocs(instRef);
      const arr: { id: string; name: string }[] = [];
      snap.forEach(docSnap => {
        arr.push({ id: docSnap.id, ...docSnap.data() } as { id: string; name: string });
      });
      setInstitutions(arr);
    };
    loadInstitutions();
  }, []);

  // Update the user's associated institution in Firestore and local state
  async function handleInstitutionUpdate() {
    try {
      if (!auth.currentUser) return;
      const uid = auth.currentUser.uid;
      const userDocRef = doc(db, 'users', uid);

      await updateDoc(userDocRef, {
        institutionId: selectedInstitutionId || null,
        updatedAt: serverTimestamp()
      });

      setProfileData(prev => ({ ...prev, institutionId: selectedInstitutionId || null }));
      setHasInstitution(!!selectedInstitutionId);
    } catch (err) {
      console.error('Error updating institution:', err);
    }
  }

  // Show loading screen while profile and skills are being fetched
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <p className="text-muted-foreground text-xl">Loading profile...</p>
        </div>
        <Footer />
      </div>
    );
  }

  // Prompt login for unauthenticated users
  if (!auth.currentUser) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center text-center">
          <p className="text-muted-foreground text-xl">You must be logged in to view your profile.</p>
          <Button className="mt-6 bg-green-500 hover:bg-green-600 text-white" onClick={() => navigate("/auth")}>Login</Button>
        </div>
        <Footer />
      </div>
    );
  }

  // Determine user role and display name for rendering profile header
  const role = profileData?.role;
  const displayName = role === "individual" ? profileData?.name : profileData?.institutionName;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Site navigation bar */}
      <Navbar />

      {/* Profile header section */}
      <section className="relative pt-20 pb-16 md:pt-28 md:pb-24 bg-muted">
        <div className="container px-6 mx-auto">
          <div className="text-center animate-in from-top flex flex-col items-center">
            <h1 className="text-4xl font-bold text-foreground tracking-tight mb-4">
              Your <span className="text-green-500">Profile</span>
            </h1>
            <p className="text-muted-foreground text-xl max-w-2xl mx-auto">
              Manage your account details and track your skill progress
            </p>
          </div>
        </div>
      </section>

      {/* Profile details and skills management section */}
      <section className="py-10 bg-background flex-grow">
        <div className="container px-6 mx-auto">
          <div className="max-w-4xl mx-auto space-y-6 animate-in from-bottom">

            <div className="glass rounded-xl p-8 shadow hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-6">
                <div className="mr-3 text-green-500">
                  {role === "individual" ? <UserCircle size={36} /> : <Building size={36} />}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">{displayName || "No Name"}</h2>
                  <p className="text-sm text-muted-foreground capitalize">Role: {role}</p>
                </div>
              </div>

              {role === 'individual' && (
                <div className="glass rounded-xl p-6 mt-6 space-y-4">
                  <h3 className="text-xl font-bold text-foreground mb-2">Institution</h3>
                  {!hasInstitution && (
                    <p className="text-sm text-muted-foreground">
                      You have not selected any institution yet.
                    </p>
                  )}
                  <div className="space-y-2">
                    <label htmlFor="inst-select" className="text-sm font-medium">
                      {hasInstitution ? 'Change Institution' : 'Add Institution'}
                    </label>
                    <Select value={selectedInstitutionId} onValueChange={setSelectedInstitutionId}>
                      <SelectTrigger className="border p-2 rounded bg-background w-full md:w-1/2">
                        {institutions.find(inst => inst.id === selectedInstitutionId)?.name || 'Select an institution'}
                      </SelectTrigger>
                      <SelectContent>
                        {institutions.map(inst => (
                          <SelectItem key={inst.id} value={inst.id}>
                            {inst.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={handleInstitutionUpdate}
                    disabled={
                      !selectedInstitutionId || selectedInstitutionId === profileData?.institutionId
                    }
                    className={`bg-green-500 text-white ${!selectedInstitutionId || selectedInstitutionId === profileData?.institutionId
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:bg-green-600'
                      }`}
                  >
                    Save Institution
                  </Button>
                </div>
              )}

              <div className="space-y-4 mt-6">
                <p className="text-muted-foreground"><strong>Email:</strong> {profileData?.email}</p>
                {role === "individual" && <p className="text-muted-foreground"><strong>Full Name:</strong> {profileData?.name}</p>}
                {role === "institution" && <p className="text-muted-foreground"><strong>Institution:</strong> {profileData?.institutionName}</p>}
              </div>
            </div>

            {role === "individual" && (
              <div className="glass rounded-xl p-8 shadow hover:shadow-lg transition-shadow">
                {/* Skills management section */}
                <h3 className="text-xl font-bold text-foreground mb-2">Manage Your Skills</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Select or update the skills that you would like to improve.
                </p>

                <div className="mb-6">
                  <SkillsSelector />
                </div>

                {skills.length > 0 && (
                  <div className="space-y-4 mt-6 max-h-64 overflow-y-auto bg-background ${theme}">
                    {skills.map((skillObj) => (
                      <div key={skillObj.name} className="border border-border p-4 rounded-lg">
                        <div className="flex justify-between">
                          <strong className="text-foreground">{skillObj.name}</strong>
                          <span className="text-sm text-muted-foreground">
                            {skillObj.category || "Uncategorized"}
                          </span>
                        </div>
                        <p className="mt-1 text-sm">Level: {skillObj.level}%</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Site footer */}
      <Footer />
    </div>
  );
};

export default ProfilePage;
