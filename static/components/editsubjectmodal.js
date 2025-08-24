export default {
    name: 'EditSubjectModal',
    props: ['show', 'subject'],
    data() {
      return {
        localSubject: { id: null, name: '', description: '' }
      };
    },
    watch: {
        subject: {
        immediate: true,
        handler(newVal) {
          this.localSubject = { ...newVal };
        }
      }
    },
    template: `
      <div v-if="show">
        <div class="modal fade show d-block" tabindex="-1" role="dialog" style="background-color: rgba(0,0,0,0.5);">
          <div class="modal-dialog" role="document">
            <div class="modal-content p-3">
              <h5 class="modal-title">Edit Subject</h5>
              <input v-model="localSubject.name" class="form-control mb-2" placeholder="Subject name" />
              <textarea v-model="localSubject.description" class="form-control mb-2" placeholder="Description"></textarea>
              <div class="text-end">
                <button class="btn btn-success me-2" @click="submit">Save</button>
                <button class="btn btn-secondary" @click="$emit('close')">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `,
    methods: {
      async submit() {
        const res = await fetch(`/api/subjects/${this.localSubject.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': localStorage.getItem('auth_token')
          },
          //
          body: JSON.stringify({
            name: this.localSubject.name,
            description: this.localSubject.description,
          })
        });
        if (res.ok) {
          this.$emit('success');
          this.$emit('close');
        } else {
          alert('Failed to update chapter');
        }
      }
    }
  };
  