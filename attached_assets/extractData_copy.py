import requests
import json
import pandas as pd
from bs4 import BeautifulSoup
import threading
import traceback
import sys

def get_hackerrank_profile(url):
    if not url or pd.isna(url) or url.strip() == "":
        return {"Total_Score": 0}

    headers = {"User-Agent": "Mozilla/5.0"}

    try:
        response = requests.get(url, headers=headers, timeout=10)

        if response.status_code != 200:
            return {"error": "Invalid URL", "Total_Score": 0}

        soup = BeautifulSoup(response.text, 'html.parser')

        badges = []
        total_score = 0

        badge_containers = soup.find_all('svg', class_="hexagon")

        for container in badge_containers:
            badge_name_tag = container.find('text', class_="badge-title")
            badge_name = badge_name_tag.text.strip(
            ) if badge_name_tag else "Unknown Badge"

            star_section = container.find('g', class_="star-section")
            star_count = len(star_section.find_all(
                'svg', class_="badge-star")) if star_section else 0

            total_score += star_count
            badges.append({'name': badge_name, 'stars': star_count})

        certifications = [
            cert.text.strip()
            for cert in soup.find_all('h2', class_="certificate_v3-heading")
        ]

        if not badges and not certifications:
            return {
                "Username": extract_username(url),
                "Coding_Score": "__",
                "Problems_Solved": "__",
                "Problems_by_Difficulty": {
                    "Easy": 0,
                    "Medium": 0,
                    "Hard": 0,
                    "Total": 0
                },
                "Total_Score": 0
            }

        return {
            "Badges": badges,
            "Certifications": certifications,
            "Total_Score": total_score
        }

    except requests.exceptions.RequestException:
        return {"error": "Invalid URL", "Total_Score": 0}

    except Exception:
        return {
            "Username": "unknown",
            "Coding_Score": "__",
            "Problems_Solved": "__",
            "Problems_by_Difficulty": {
                "Easy": 0,
                "Medium": 0,
                "Hard": 0,
                "Total": 0
            },
            "Total_Score": 0
        }


def scrape_codechef_profile(url):
    if not url or pd.isna(url) or url.strip() == "":
        return {"Total_Score": 0}

    headers = {"User-Agent": "Mozilla/5.0"}
    try:
        response = requests.get(url, headers=headers)

        if response.status_code != 200:
            return {"error": "Failed to fetch profile", "Total_Score": 0}

        soup = BeautifulSoup(response.text, 'html.parser')
        try:
            username = soup.find("span",
                                 class_="m-username--link").text.strip()
            star = soup.find("span", class_="rating").text.strip()
            rating = soup.find("div", class_="rating-number").text.strip()
            contests_participated = int(
                soup.find("div", class_="contest-participated-count").find(
                    "b").text.strip())

            total_score = contests_participated * 2

            return {
                "Username": username,
                "Star": star,
                "Rating": rating,
                "Contests_Participated": contests_participated,
                "Total_Score": total_score
            }
        except Exception as e:
            return {
                "Username": extract_username(url),
                "Coding_Score": "__",
                "Problems_Solved": "__",
                "Problems_by_Difficulty": {
                    "Easy": 0,
                    "Medium": 0,
                    "Hard": 0,
                    "Total": 0
                },
                "Total_Score": 0
            }
    except Exception:
        return {"error": "Failed to fetch profile", "Total_Score": 0}


def is_url_accessible(url):
    """Check if the given URL is accessible and return the response object."""
    try:
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            return response
    except requests.exceptions.RequestException:
        return None
    return None


def scrape_gfg_profile(url):
    """Scrape a user's GeeksforGeeks profile for coding statistics."""
    if not url or pd.isna(url) or url.strip() == "":
        return {"Total_Score": 0}

    response = is_url_accessible(url)
    if not response:
        return {"Error": "Invalid or inaccessible URL", "Total_Score": 0}

    soup = BeautifulSoup(response.text, 'html.parser')

    try:
        # Extract username
        username_tag = soup.find(
            "div", class_="profilePicSection_head_userHandle__oOfFy")
        if not username_tag:
            raise ValueError("Username not found in profile")

        username = username_tag.text.strip()

        # Extract coding score and problems solved
        scores = soup.find_all("div",
                               class_="scoreCard_head_left--score__oSi_x")
        coding_score = scores[0].text.strip() if len(scores) > 0 else "N/A"
        problems_solved = scores[1].text.strip() if len(scores) > 1 else "N/A"

        # Extract problem counts
        problem_counts = soup.find_all(
            "div", class_="problemNavbar_head_nav--text__UaGCx")
        problems_dict = {
            "School": 0,
            "Basic": 0,
            "Easy": 0,
            "Medium": 0,
            "Hard": 0,
            "Total": 0
        }

        for problem in problem_counts:
            text = problem.text.strip()
            if "(" in text and ")" in text:
                category, count = text.rsplit(" (", 1)
                count = int(count.rstrip(")"))
                category = category.strip().upper()

                if category == "SCHOOL":
                    problems_dict["School"] = count
                elif category == "BASIC":
                    problems_dict["Basic"] = count
                elif category == "EASY":
                    problems_dict["Easy"] = count
                elif category == "MEDIUM":
                    problems_dict["Medium"] = count
                elif category == "HARD":
                    problems_dict["Hard"] = count

        # Calculate total problems solved (School + Basic + Easy + Medium + Hard)
        problems_dict["Total"] = (problems_dict["School"] +
                                  problems_dict["Basic"] +
                                  problems_dict["Easy"] +
                                  problems_dict["Medium"] +
                                  problems_dict["Hard"])

        # Calculate total score (Only Easy + Medium + Hard contribute)
        total_score = (problems_dict["Easy"] * 1) + (
            problems_dict["Medium"] * 2) + (problems_dict["Hard"] * 3)

        return {
            "Username": username,
            "Coding_Score": coding_score,
            "Total_Problems_Solved":
            problems_dict["Total"],  # Includes School + Basic
            "Problems_by_Difficulty": {
                "Easy": problems_dict["Easy"],
                "Medium": problems_dict["Medium"],
                "Hard": problems_dict["Hard"]
            },
            "Total_Score": total_score  # Only Easy + Medium + Hard
        }

    except ValueError as ve:
        print(f"Data Parsing Error: {ve}")
        return {"Error": str(ve), "Total_Score": 0}

    except AttributeError:
        print("Details not found.")
        return {"Error": "Failed to parse profile details", "Total_Score": 0}

    except Exception as e:
        print(f"Unexpected Error: {e}")
        return {"Error": "An unexpected error occurred", "Total_Score": 0}


def extract_username(url):
    """ Extracts the correct username from the profile URL """
    if not url or pd.isna(url) or url.strip() == "":
        return "N/A"

    url = url.rstrip("/")
    parts = url.split("/")

    # Extract username from various URL formats
    if "leetcode.com" in url:
        if "u" in parts and parts[-2] == "u":  # Handles '/u/username' format
            return parts[-1]
        return parts[-1]  # Default case for 'leetcode.com/username'
    elif "codechef.com" in url:
        return parts[-1]
    elif "hackerrank.com" in url:
        return parts[-1]
    elif "geeksforgeeks.org" in url:
        return parts[-1]

    return "N/A"


def fetch_leetcode_data(username):
    if not username or username == "N/A":
        return None

    query = """
    {
      matchedUser(username: "%s") {
        submitStats {
          acSubmissionNum {  # Fetch only unique accepted problems
            difficulty
            count
          }
        }
        profile {
          ranking
        }
      }

      userContestRanking(username: "%s") {
        attendedContestsCount
        rating
      }
    }
    """ % (username, username)

    headers = {"Content-Type": "application/json"}

    try:
        response = requests.post("https://leetcode.com/graphql",
                                 json={"query": query},
                                 headers=headers,
                                 timeout=15)

        if response.status_code == 200:
            data = response.json()
            if "errors" in data:
                return None
            return data.get("data", {})
        else:
            return None
    except Exception:
        return None


def get_leetcode_profile(url):
    if not url or pd.isna(url) or url.strip() == "":
        return {"Total_Score": 0}

    username = extract_username(url)

    if username == "N/A":
        return {
            "Username": "N/A",
            "Problems": {
                "Easy": 0,
                "Medium": 0,
                "Hard": 0,
                "Total": 0
            },
            "Total_Score": 0,
            "Contests_Attended": 0,
            "Rating": 0
        }

    try:
        data = fetch_leetcode_data(username)

        # Check if data is None before proceeding
        if data is None:
            return {
                "Username": username,
                "Problems": {
                    "Easy": 0,
                    "Medium": 0,
                    "Hard": 0,
                    "Total": 0
                },
                "Total_Score": 0,
                "Contests_Attended": 0,
                "Rating": 0
            }

        user = data.get("matchedUser", {})
        contest = data.get("userContestRanking", {})

        if not user and not contest:
            return {
                "Username": username,
                "Problems": {
                    "Easy": 0,
                    "Medium": 0,
                    "Hard": 0,
                    "Total": 0
                },
                "Total_Score": 0,
                "Contests_Attended": 0,
                "Rating": 0
            }

        # Check if submitStats or acSubmissionNum is None before proceeding
        submit_stats = user.get("submitStats", {})
        if submit_stats is None:
            submit_stats = {}

        ac_submission_num = submit_stats.get("acSubmissionNum", [])
        if ac_submission_num is None:
            ac_submission_num = []

        total_problems = {
            submission.get('difficulty', ''): submission.get('count', 0)
            for submission in ac_submission_num if submission
        }

        problems = {
            "Easy":
            total_problems.get("Easy", 0),
            "Medium":
            total_problems.get("Medium", 0),
            "Hard":
            total_problems.get("Hard", 0),
            "Total":
            total_problems.get("Easy", 0) + total_problems.get("Medium", 0) +
            total_problems.get("Hard", 0)
        }

        # Check if contest is None before accessing attributes
        contests_attended = 0
        rating = 0
        if contest:
            contests_attended = contest.get("attendedContestsCount", 0) or 0
            rating = contest.get("rating", 0) or 0

        total_score = (problems["Easy"] * 1) + (problems["Medium"] * 2) + (
            problems["Hard"] * 3) + (contests_attended * 2)

        return {
            "Username": username,
            "Problems": problems,
            "Total_Score": total_score,
            "Contests_Attended": contests_attended,
            "Rating": rating
        }
    except Exception as e:
        print(f"Error in get_leetcode_profile: {e}")
        return {
            "Username": username,
            "Problems": {
                "Easy": 0,
                "Medium": 0,
                "Hard": 0,
                "Total": 0
            },
            "Total_Score": 0,
            "Contests_Attended": 0,
            "Rating": 0
        }


def fetch_profile_data(url, fetch_function, results, key, lock):
    """Thread-safe function to fetch profile data with proper error handling"""
    try:
        if pd.isna(url) or not url or url.strip() == "":
            profile_data = {"Total_Score": 0}
        else:
            profile_data = fetch_function(url)
            # Ensure Total_Score key exists and has correct name
            if "Total Score" in profile_data and "Total_Score" not in profile_data:
                profile_data["Total_Score"] = profile_data.pop("Total Score")
            elif "Total_Score" not in profile_data:
                profile_data["Total_Score"] = 0

        # Thread-safe update of results dictionary
        with lock:
            results[key] = profile_data
    except Exception as e:
        print(f"Error in fetch_profile_data for {key}: {str(e)}")
        print(traceback.format_exc())
        with lock:
            results[key] = {"Total_Score": 0, "Error": str(e)}


def main():
    try:
        df = pd.read_excel(sys.argv[1])
        student_profiles = {}

        # Create a lock for thread-safe dictionary updates
        results_lock = threading.Lock()

        for _, row in df.iterrows():
            roll_no = str(row["Roll Number"]).strip()
            gfg_url = row.get("GeeksforGeeks", "")
            codechef_url = row.get("CodeChef", "")
            hackerrank_url = row.get("HackerRank", "")
            leetcode_url = row.get("LeetCode", "")

            results = {}
            threads = []

            # Create threads for all platforms
            threads.append(
                threading.Thread(target=fetch_profile_data,
                                 args=(codechef_url, scrape_codechef_profile,
                                       results, "CodeChef", results_lock)))

            threads.append(
                threading.Thread(target=fetch_profile_data,
                                 args=(gfg_url, scrape_gfg_profile, results,
                                       "GeeksForGeeks", results_lock)))

            threads.append(
                threading.Thread(target=fetch_profile_data,
                                 args=(hackerrank_url, get_hackerrank_profile,
                                       results, "HackerRank", results_lock)))

            threads.append(
                threading.Thread(target=fetch_profile_data,
                                 args=(leetcode_url, get_leetcode_profile,
                                       results, "LeetCode", results_lock)))

            # Start all threads
            for thread in threads:
                thread.start()

            # Wait for all threads to complete
            for thread in threads:
                thread.join()

            student_profiles[roll_no] = {"Profiles": {**results}}

        # Write the results to a JSON file
        with open("students_profiles.json", "w", encoding="utf-8") as f:
            json.dump({"Profiles": student_profiles},
                      f,
                      indent=4,
                      default=list)

    except Exception as e:
        print(f"Error in main function: {str(e)}")
        print(traceback.format_exc())


if __name__ == "__main__":
    main()
