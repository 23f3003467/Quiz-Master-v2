// This is a Vue component for the Admin Dashboard
// import admin_subject from "../components/admin_subject.js";
import user_dash from "../components/user_dash.js";
import UserScores from "../components/user_score.js";
import usersummary from "../components/usersummary.js";
// import Admin_quiz from "../components/admin_quiz.js";
// import admin_chapters from "../components/admin_chapters.js"; // Uncomment when available
// import admin_quizzes from "../components/admin_quizzes.js";
// import admin_questions from "../components/admin_questions.js";

export default {
    template: `
        <div class="container mt-4">
            <h2>User Dashboard</h2>

            <!-- Navigation tabs to switch views -->
            <ul class="nav nav-tabs mb-4">
                <li class="nav-item" v-for="tab in tabs" :key="tab.name">
                    <a class="nav-link"
                       href="#"
                       :class="{ active: activeTab === tab.name }"
                       @click.prevent="activeTab = tab.name">
                        {{ tab.label }}
                    </a>
                </li>
            </ul>

            <!-- Dynamic component rendering -->
            <component :is="activeTabComponent" />
        </div>
    `,

    data() {
        return {
            activeTab: 'home', // Default tab
            tabs: [
                { name: 'home', label: 'Home' },
                { name: 'scores', label: 'Scores' },
                { name: 'summary', label: 'Summary' }
               
            ]
        };
    },

    computed: {
        // Determine which component to show based on activeTab
        activeTabComponent() {
            const key = `user-${this.activeTab}`;
            return this.$options.components[key] ? key : 'user-home'; // Fallback
        }
    },

    components: {
        'user-home': user_dash,
        'user-scores': UserScores,
        'user-summary': usersummary,
        // 'admin-chapters': admin_chapters,
        
    }
};


// Each of the SubjectsComponent, ChaptersComponent, etc., should be defined in their own file or registered above.
// They should handle listing, creating, updating, and deleting for their respective entities.
// This main dashboard handles only the navigation and layout.

// The rest of your original logic (modals, forms, and API calls) should now go into those smaller components.
// Example: SubjectsComponent should have the subject form modal, the list, and related API calls.

// This simplifies the main dashboard and splits responsibilities into smaller pieces, which is easier for beginners to understand and maintain.
