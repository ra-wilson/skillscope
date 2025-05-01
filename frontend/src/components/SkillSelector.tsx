// frontend/src/components/SkillSelector.tsx
import { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectContent, SelectItem } from '@/components/ui/select';
import { skillCategories } from '@/data/assessmentOptions';

const SkillsToImproveSelector: React.FC = () => {
  const { skillsToImprove, updateSkillsToImprove } = useUser();
  const [selected, setSelected] = useState<string[]>(skillsToImprove);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setSelected(skillsToImprove);
    setHasChanges(false);
  }, [skillsToImprove]);

  const toggleSkill = (skill: string) => {
    if (selected.includes(skill)) {
      setSelected(selected.filter(s => s !== skill));
    } else {
      setSelected([...selected, skill]);
    }
    setHasChanges(true);
  };

  const savePreferences = () => {
    updateSkillsToImprove(selected);
    setHasChanges(false);
  };

  // Get all skills from all categories
  const allSkills = skillCategories.flatMap(category => 
    category.skills.map(skill => ({
      name: skill.name,
      category: category.name
    }))
  );

  // Filter skills by selected category
  const filteredSkills = selectedCategory === 'All' 
    ? allSkills 
    : allSkills.filter(skill => skill.category === selectedCategory);

  return (
    <div className="p-6 border rounded-lg shadow-sm bg-background">
      <h2 className="text-xl font-semibold mb-4">Skills to Improve</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Select the skills you'd like to focus on improving.
      </p>

      <div className="mb-6">
        <label className="text-sm font-medium mb-2 block">Filter by Category</label>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full md:w-1/2">
            {selectedCategory}
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Categories</SelectItem>
            {skillCategories.map(category => (
              <SelectItem key={category.name} value={category.name}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-6">
        {filteredSkills.map(skill => (
          <button
            key={skill.name}
            onClick={() => toggleSkill(skill.name)}
            className={`border rounded-md px-3 py-1.5 text-sm transition-colors ${
              selected.includes(skill.name)
                ? 'bg-green-500 text-white border-green-500'
                : 'bg-background text-foreground border-border hover:bg-muted'
            }`}
          >
            {skill.name}
          </button>
        ))}
      </div>

      <Button 
        onClick={savePreferences}
        className={`w-full md:w-auto ${
          !hasChanges ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        disabled={!hasChanges}
      >
        Save Preferences
      </Button>
    </div>
  );
};

export default SkillsToImproveSelector;