
import EditChapterModal from "./editchaptermodal.js";
import AddSubjectModal from "./addsubjectmodal.js";
import EditSubjectModal from "./editsubjectmodal.js";

export default {
    template: `
      <div>
        <h2 class="mt-3">Subjects</h2>
  
        <div v-for="subject in subjects" :key="subject.id" class="card my-3">
          <div class="card-body">
            <h4>{{ subject.name }}</h4>
            <p>{{ subject.description }}</p>
            <button class="btn btn-sm btn-danger" @click="deleteSubject(subject.id)">Delete</button>
            <button class="btn btn-sm btn-warning me-1" @click="editSubject(subject)">Edit</button>
            <!-- 🧾 Chapters Table -->
            <table class="table table-bordered mt-3">
              <thead>
                <tr>
                  <th>Chapter Name</th>
                  <th>No. of Questions</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="chapter in subject.chapters" :key="chapter.id">
                  <td>{{ chapter.name }}</td>
                  <td>{{ chapter.question_count }}</td>
                  <td>
                    <button class="btn btn-sm btn-warning me-1" @click="editChapter(chapter)">Edit</button>
                    <button class="btn btn-sm btn-danger" @click="deleteChapter(chapter.id)">Delete</button>
                  </td>
                </tr>
              </tbody>
            </table>
  
            <!-- ➕ Add Chapter -->
            <div class="mt-3">
              <input v-model="newChapters[subject.id].name" placeholder="New Chapter Name" class="form-control mb-1">
              <input v-model="newChapters[subject.id].description" placeholder="Description" class="form-control mb-1">
              <button class="btn btn-sm btn-success" @click="addChapter(subject.id)">Add Chapter</button>
            </div>
          </div>
        </div>

        <!-- ➕ Add New Subject -->
        <div class="card my-4">
          <div class="card-body">
            <h4>Add New Subject</h4>
            <add-subject-modal
          :show="showAddSubModal"
          @close="showAddSubModal = false"
          @success="fetchSubjects"
            ></add-subject-modal>
            <button class="btn btn-primary" @click="showAddSubModal = true">+ Add Subject</button>
          </div>
        </div>

        <!-- ✏️ Edit Chapter Modal -->
        <edit-chapter-modal
          :show="showEditChapModal"
          :chapter="editChap"
          @close="showEditChapModal = false"
          @success="fetchSubjects"
        />
         <!-- ✏️ Edit Subject Modal -->
        <edit-subject-modal
          :show="showEditSubModal"
          :subject="editSub"
          @close="showEditSubModal = false"
          @success="fetchSubjects"
        />

      </div>
      
    
    `,
    components: {
      'edit-chapter-modal': EditChapterModal,
      'edit-subject-modal': EditSubjectModal,
      'add-subject-modal': AddSubjectModal
    }
    ,
    data() {
      return {
        subjects: [],
        newChapters: {},
        newSubject: { name: '', description: '' },
        editSub:null,
        editChap: null,
        showEditChapModal: false,
        showEditSubModal:false, 
        showAddSubModal: false
      };
    },
    async mounted() {
      await this.fetchSubjects();
      // console.log(this.subjects);
    },
    methods: {

      async fetchSubjects() {
        const res = await fetch('/api/subjects', {
          headers: {
            'Authentication-Token': localStorage.getItem('auth_token')
          }
        });
        const data = await res.json();
        this.subjects = data;
        this.newChapters = {};
        data.forEach(sub => {
          this.newChapters[sub.id] = { name: '', description: '' };
        });
      },
      async addChapter(subjectId) {
        const chapter = this.newChapters[subjectId];
        if (!chapter.name.trim()) return alert("Chapter name required!");
        const res = await fetch('/api/chapters', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': localStorage.getItem('auth_token')
          },
          body: JSON.stringify({
            name: chapter.name,
            description: chapter.description,
            subject_id: subjectId
          })
        });
        if (res.ok) {
          await this.fetchSubjects();
        } else {
          alert("Failed to add chapter");
        }
      },
      // async addSubject() {
      //   const sub = this.newSubject;
      //   if (!sub.name.trim()) return alert("Subject name required!");
      //   const res = await fetch('/api/subjects', {
      //     method: 'POST',
      //     headers: {
      //       'Content-Type': 'application/json',
      //       'Authentication-Token': localStorage.getItem('auth_token')
      //     },
      //     body: JSON.stringify(sub)
      //   });
      //   if (res.ok) {
      //     this.newSubject = { name: '', description: '' };
      //     await this.fetchSubjects();
      //   } else {
      //     alert("Failed to add subject");
      //   }
      // },
      editChapter(chap) {
        this.editChap = { ...chap }; //deep copy
        this.showEditChapModal = true;
      },
      editSubject(sub) {
        this.editSub = { ...sub }; //deep copy
        // console.log(this.editSub); // ✅ Correct way

        this.showEditSubModal = true;
      }
      
      ,
      async deleteChapter(chapterId) {
        if (!confirm("Are you sure you want to delete this chapter?")) return;
        const res = await fetch(`/api/chapters/${chapterId}`, {
          method: 'DELETE',
          headers: {
            'Authentication-Token': localStorage.getItem('auth_token')
          }
        });
        if (res.ok) {
          await this.fetchSubjects();
        } else {
          alert("Failed to delete chapter");
        }
      },
      async deleteSubject(subjectId) {
        // /api/subjects/<int:subject_id></int:subject_id>
        if (!confirm("Are you sure you want to delete this chapter?")) return;
        const res = await fetch(`/api/subjects/${subjectId}`, {
          method: 'DELETE',
          headers: {
            'Authentication-Token': localStorage.getItem('auth_token')
          }
        });
        if (res.ok) {
          await this.fetchSubjects();
          console.log(this.subjects);
        } else {
          alert("Failed to delete chapter");
        }
      },
      // async updateChapter() {
      //   const res = await fetch(`/api/chapters/${this.editChapterData.id}`, {
      //     method: 'PUT',
      //     headers: {
      //       'Content-Type': 'application/json',
      //       'Authentication-Token': localStorage.getItem('auth_token')
      //     },
      //     body: JSON.stringify({
      //       name: this.editChapterData.name,
      //       description: this.editChapterData.description,
      //       subject_id: this.editChapterData.subject_id  // Include subject_id if needed
      //     })
      //   });
      //   if (res.ok) {
      //     this.showEditModal = false;
      //     await this.fetchSubjects();
      //   } else {
      //     alert('Failed to update chapter');
      //   }
      // }
      
    }
  };
  