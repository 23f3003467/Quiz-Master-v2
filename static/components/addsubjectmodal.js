export default {
    name: 'AddSubjectModal',
    props: ['show'],
    data() {
      return {
        subject: { name: '', description: '' }
      };
    },
    template: `
    <div v-if="show">
      <div class="modal fade show d-block" tabindex="-1" role="dialog" style="background-color: rgba(0,0,0,0.5);">
        <div class="modal-dialog" role="document">
          <div class="modal-content p-3">
            <h5 class="modal-title">Add Subject</h5>
            <input v-model="subject.name" class="form-control mb-2" placeholder="Subject name" required />
            <textarea v-model="subject.description" class="form-control mb-2" placeholder="Description" required></textarea>
            <div class="text-end">
              <button class="btn btn-success me-2" @click="submit">Add</button>
              <button class="btn btn-secondary" @click="$emit('close')">Cancel</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
  ,
    methods: {
//       :show="showAddModal" → send boolean from parent to child

// props: ['show'] → child receives that as prop

// v-if="show" → conditionally renders the modal in child

// $emit('close') → child tells parent “I'm done”

// @close="showAddModal = false" → parent hides modal again
onCancel() {
  console.log("okay button");
  this.$emit('close');
},
      async submit() {
        if (this.subject.name.trim() === '' || this.subject.description.trim() === '') {
          // Validate input
          alert('Please fill in all fields');
          return; // Exit if validation fails
        }
        const res = await fetch('/api/subjects', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': localStorage.getItem('auth_token')
          },
          body: JSON.stringify(this.subject)
        });
        const data = await res.json(); // 👈 Parse the response body

        if (res.ok) {
          alert(data.message); // ✅ Show success message from backend
          this.$emit('success'); // Tell parent to refresh
          this.$emit('close');   // Close modal
          this.subject = { name: '', description: '' };
        } else {
          alert(data.message || "Failed to add subject"); // ❌ Show backend error message
        }
      }
    },
    
  };
  