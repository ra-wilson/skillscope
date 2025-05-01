import { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { useUser } from '@/contexts/UserContext';



const SkillCard = ({ skill, icon, category = 'Frontend', initialLevel = 0 }) => {
  const { skills, updateSkill } = useUser();
  const [level, setLevel] = useState(skills[skill] || initialLevel);

  const handleChange = (val: number[]) => {
    const newLevel = val[0];
    setLevel(newLevel);
    updateSkill(skill, newLevel);
  };


  const getSkillLevelText = (level: number) => {
    if (level <= 20) return 'Beginner';
    if (level <= 40) return 'Novice';
    if (level <= 60) return 'Intermediate';
    if (level <= 80) return 'Advanced';
    return 'Expert';
  };

  const getSkillColor = (level: number) => {
    if (level <= 20) return 'text-gray-500 dark:text-gray-400';
    if (level <= 40) return 'text-blue-500 dark:text-blue-400';
    if (level <= 60) return 'text-green-500 dark:text-green-400';
    if (level <= 80) return 'text-yellow-500 dark:text-yellow-400';
    return 'text-red-500 dark:text-red-400';
  };

  return (
    <div className="glass p-6 rounded-xl transition-all duration-300 hover:shadow-xl">
      <div className="flex items-center mb-4">
        <div className="mr-3 text-green-500 dark:text-green-400 group-hover:text-green-600 dark:group-hover:text-green-300 transition-colors">
          {icon}
        </div>
        <h3 className="text-lg font-medium text-foreground">{skill}</h3>
      </div>
      
      <div className="space-y-4">
        <Slider
          value={[level]}
          max={100}
          step={5}
          onValueChange={handleChange}
          className="pb-2"
        />
        
        <div className="flex justify-between items-center">
          <span className={`text-sm font-medium ${getSkillColor(level)}`}>
            {getSkillLevelText(level)}
          </span>
          <span className="text-sm text-muted-foreground font-semibold">
            {level}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default SkillCard;
