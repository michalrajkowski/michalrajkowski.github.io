from js import fetch, console
import random

# File paths
subclassess_file = '/data/text data/subclassess.txt'
names_file = '/data/text data/names.txt'
subclass_skills_file = '/data/text data/skills_subclass.txt'
all_skills_file = '/data/text data/skills_all.txt'
goals_neutral_small_file = '/data/text data/goals_neutral_small.txt'
goals_neutral_big_file = '/data/text data/goals_neutral_big.txt'
class_goals_small_file = '/data/text data/goals_class_small.txt'
class_goals_big_file = '/data/text data/goals_class_big.txt'

# Modified load functions
def load_subclassess(data):
    return [line.strip() for line in data.splitlines() if line.strip()]

def load_names(data, subclasses_list):
    subclasses_names = {}
    current_subclass = None
    for line in data.splitlines():
        if line.strip():
            if line.strip() in subclasses_list:
                current_subclass = line.strip()
                subclasses_names[current_subclass] = []
                continue
            if current_subclass:
                subclasses_names[current_subclass].append(line.strip())
    return subclasses_names

def load_subclass_skills(data, subclasses_list):
    subclass_skills = {}
    current_subclass = None
    for line in data.splitlines():
        if line.strip():
            if line.strip() in subclasses_list:
                current_subclass = line.strip()
                subclass_skills[current_subclass] = []
                continue
            if current_subclass:
                subclass_skills[current_subclass].append(line.strip())
    return subclass_skills

def load_all_skills(data):
    return [line.strip() for line in data.splitlines() if line.strip()]

def load_goals_neutral_small(data):
    goals_neutral_small = []
    goal_name = None
    for line in data.splitlines():
        if line.strip():
            if goal_name is None:
                goal_name = line.strip()
                continue
            goals_neutral_small.append((goal_name, line.strip()))
            goal_name = None
    return goals_neutral_small

def load_goals_neutral_big(data):
    goals_neutral_big = []
    goal_name = None
    for line in data.splitlines():
        if line.strip():
            if goal_name is None:
                goal_name = line.strip()
                continue
            goals_neutral_big.append((goal_name, line.strip()))
            goal_name = None
    return goals_neutral_big

def load_goals_class_small(data, subclasses_list):
    class_goals_small = {}
    current_subclass = None
    goal_name = None
    for line in data.splitlines():
        if line.strip():
            if line.strip() in subclasses_list:
                current_subclass = line.strip()
                class_goals_small[current_subclass] = []
                continue
            if goal_name is None:
                goal_name = line.strip()
                continue
            if current_subclass:
                class_goals_small[current_subclass].append((goal_name, line.strip()))
            goal_name = None
    return class_goals_small

def load_goals_class_big(data, subclasses_list):
    class_goals_big = {}
    current_subclass = None
    goal_name = None
    for line in data.splitlines():
        if line.strip():
            if line.strip() in subclasses_list:
                current_subclass = line.strip()
                class_goals_big[current_subclass] = []
                continue
            if goal_name is None:
                goal_name = line.strip()
                continue
            if current_subclass:
                class_goals_big[current_subclass].append((goal_name, line.strip()))
            goal_name = None
    return class_goals_big

async def load_all_data(data):
    (
        subclassess_data,
        names_data,
        subclass_skills_data,
        all_skills_data,
        goals_neutral_small_data,
        goals_neutral_big_data,
        class_goals_small_data,
        class_goals_big_data
    ) = data
    print("XD x2")

    subclasses_list = load_subclassess(subclassess_data)
    subclasses_names = load_names(names_data, subclasses_list)
    subclass_skills = load_subclass_skills(subclass_skills_data, subclasses_list)
    all_skills = load_all_skills(all_skills_data)
    goals_neutral_small = load_goals_neutral_small(goals_neutral_small_data)
    goals_neutral_big = load_goals_neutral_big(goals_neutral_big_data)
    class_goals_small = load_goals_class_small(class_goals_small_data, subclasses_list)
    class_goals_big = load_goals_class_big(class_goals_big_data, subclasses_list)

    return {
        "subclasses_list": subclasses_list,
        "subclasses_names": subclasses_names,
        "subclass_skills": subclass_skills,
        "all_skills": all_skills,
        "goals_neutral_small": goals_neutral_small,
        "goals_neutral_big": goals_neutral_big,
        "class_goals_small": class_goals_small,
        "class_goals_big": class_goals_big,
    }

def build_random_character(data):
    # Random subclass and name generation logic
    subclasses_list = data["subclasses_list"]
    subclasses_names = data["subclasses_names"]
    subclass_skills = data["subclass_skills"]
    all_skills = data["all_skills"]
    goals_neutral_small = data["goals_neutral_small"]
    goals_neutral_big = data["goals_neutral_big"]
    class_goals_small = data["class_goals_small"]
    class_goals_big = data["class_goals_big"]

    if not subclasses_list:  # Check if data is loaded
        console.log("Data not loaded!")
        return

    this_subclass = random.choice(subclasses_list)
    this_name = random.choice(subclasses_names[this_subclass])
    character_info = f"{this_subclass}\n{this_name}\n"

    # Skills and goals generation logic
    this_skills = random.sample(subclass_skills[this_subclass], 3)
    not_used_skills = list(filter(lambda item: item not in this_skills, all_skills))
    this_skills.extend(random.sample(not_used_skills, 2))

    this_small_goals = random.sample(goals_neutral_small, 1)
    this_small_goals.extend(random.sample(class_goals_small[this_subclass], 1))
    chance = random.random()

    this_big_goals = random.sample(goals_neutral_big, 1) if chance < 0.5 else random.sample(class_goals_big[this_subclass], 1)

    # Output to console for debugging
    console.log(f"Character Info: {character_info}")
    console.log(f"Skills: {this_skills}")
    console.log(f"Small Goals: {this_small_goals}")
    console.log(f"Big Goals: {this_big_goals}")

    # Formatting the output
    small_goals_formatted = "<br><br>".join(
        [f"<b>{title}</b>: <i>{description}</i>" for title, description in this_small_goals]
    )
    
    big_goals_formatted = "<br><br>".join(
        [f"<b>{title}</b>: <i>{description}</i>" for title, description in this_big_goals]
    )

    return (
        "<h1>" +str(this_name) + "/<h1><br>" 
         + "<h3>" + str(this_subclass) + "</h3><br>"+
        "<br><h2>Skills: </h2><br>" + str(this_skills) + 
        "<br><br><h2>Small Goals:</h2><br>" + small_goals_formatted + 
        "<br><br><h2>Big Goals:</h2><br>" + big_goals_formatted
    )
