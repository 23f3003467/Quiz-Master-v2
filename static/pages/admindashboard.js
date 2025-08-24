// This is a Vue component for the Admin Dashboard
import admin_subject from "../components/admin_subject.js";
import adminsummary from "../components/adminsummary.js";
import Admin_quiz from "../components/admin_quiz.js";

// import admin_chapters from "../components/admin_chapters.js"; // Uncomment when available
// import admin_quizzes from "../components/admin_quizzes.js";
// import admin_questions from "../components/admin_questions.js";

export default {
    template: `
        <div class="container mt-4">
            <h2>Admin Dashboard</h2>

            <!-- Navigation tabs to switch views and conditional bootstrap class -->
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
            activeTab: 'Home', // Default tab
            tabs: [
                { name: 'home', label: 'Home' },
                { name: 'quizzes', label: 'Quizzes' },
                { name: 'summary', label: 'Summary' }
            ]
        };
    },

    computed: {
        // Determine which component to show based on activeTab
        activeTabComponent() {
            const key = `admin-${this.activeTab}`;
            return this.$options.components[key] ? key : 'admin-home'; // Fallback
        }
    },

    components: {
        'admin-home': admin_subject,
        'admin-quizzes': Admin_quiz,
        'admin-summary': adminsummary,
    }
};


// Each of the SubjectsComponent, ChaptersComponent, etc., should be defined in their own file or registered above.
// They should handle listing, creating, updating, and deleting for their respective entities.
// This main dashboard handles only the navigation and layout.

// The rest of your original logic (modals, forms, and API calls) should now go into those smaller components.
// Example: SubjectsComponent should have the subject form modal, the list, and related API calls.

// This simplifies the main dashboard and splits responsibilities into smaller pieces, which is easier for beginners to understand and maintain.
