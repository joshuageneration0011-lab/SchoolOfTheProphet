const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export const api = {
  auth: {
    login: (email: string, password: string) => 
      fetchAPI('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      }),
    signup: (name: string, email: string, password: string) => 
      fetchAPI('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ name, email, password })
      })
  },
  courses: {
    list: () => fetchAPI('/courses'),
    create: (courseData: any) => 
      fetchAPI('/courses', {
        method: 'POST',
        body: JSON.stringify(courseData)
      }),
    addVideo: (courseId: string, videoData: any) => 
      fetchAPI(`/courses/${courseId}/videos`, {
        method: 'POST',
        body: JSON.stringify(videoData)
      })
  },
  books: {
    list: () => fetchAPI('/books'),
    create: (bookData: any) => 
      fetchAPI('/books', {
        method: 'POST',
        body: JSON.stringify(bookData)
      }),
    update: (bookId: string, bookData: any) => 
      fetchAPI(`/books/${bookId}`, {
        method: 'PUT',
        body: JSON.stringify(bookData)
      }),
    delete: (bookId: string) => 
      fetchAPI(`/books/${bookId}`, {
        method: 'DELETE'
      })
  },
  audios: {
    list: () => fetchAPI('/audios'),
    create: (audioData: any) =>
      fetchAPI('/audios', {
        method: 'POST',
        body: JSON.stringify(audioData)
      }),
    update: (audioId: string, audioData: any) =>
      fetchAPI(`/audios/${audioId}`, {
        method: 'PUT',
        body: JSON.stringify(audioData)
      }),
    delete: (audioId: string) =>
      fetchAPI(`/audios/${audioId}`, { method: 'DELETE' })
  },
  users: {
    list: () => fetchAPI('/users'),
    updateStatus: (userId: string, status: string) => 
      fetchAPI(`/users/${userId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      }),
    purchaseAudio: (userId: string, audioId: string) =>
      fetchAPI(`/users/${userId}/purchase-audio`, {
        method: 'PUT',
        body: JSON.stringify({ audioId })
      })
  },
  transactions: {
    list: () => fetchAPI('/transactions'),
    create: (txData: any) => 
      fetchAPI('/transactions', {
        method: 'POST',
        body: JSON.stringify(txData)
      })
  },
  assignments: {
    list: () => fetchAPI('/assignments'),
    submit: (assignmentData: any) => 
      fetchAPI('/assignments', {
        method: 'POST',
        body: JSON.stringify(assignmentData)
      }),
    grade: (assignmentId: string, gradeData: any) => 
      fetchAPI(`/assignments/${assignmentId}/grade`, {
        method: 'PUT',
        body: JSON.stringify(gradeData)
      })
  },
  support: {
    list: () => fetchAPI('/support'),
    create: (ticketData: any) => 
      fetchAPI('/support', {
        method: 'POST',
        body: JSON.stringify(ticketData)
      }),
    resolve: (ticketId: string, replyData: any) => 
      fetchAPI(`/support/${ticketId}/resolve`, {
        method: 'PUT',
        body: JSON.stringify(replyData)
      })
  },
  broadcasts: {
    list: () => fetchAPI('/broadcasts'),
    create: (bcData: any) => 
      fetchAPI('/broadcasts', {
        method: 'POST',
        body: JSON.stringify(bcData)
      }),
    notify: (bcId: string) => 
      fetchAPI(`/broadcasts/${bcId}/notify`, {
        method: 'PUT'
      }),
    delete: (bcId: string) => 
      fetchAPI(`/broadcasts/${bcId}`, {
        method: 'DELETE'
      })
  },
  certificates: {
    list: () => fetchAPI('/certificates'),
    verify: (certId: string) => fetchAPI(`/certificates/verify/${certId}`),
    create: (certData: any) => 
      fetchAPI('/certificates', {
        method: 'POST',
        body: JSON.stringify(certData)
      }),
    updateStatus: (certId: string, status: string) => 
      fetchAPI(`/certificates/${certId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      })
  },
  mentorship: {
    groups: {
      list: () => fetchAPI('/mentorship/groups'),
      create: (groupData: any) => 
        fetchAPI('/mentorship/groups', {
          method: 'POST',
          body: JSON.stringify(groupData)
        })
    },
    messages: {
      list: () => fetchAPI('/mentorship/messages'),
      create: (msgData: any) => 
        fetchAPI('/mentorship/messages', {
          method: 'POST',
          body: JSON.stringify(msgData)
        })
    }
  },
  promotions: {
    coupons: {
      list: () => fetchAPI('/promotions/coupons'),
      create: (couponData: any) => 
        fetchAPI('/promotions/coupons', {
          method: 'POST',
          body: JSON.stringify(couponData)
        }),
      updateStatus: (couponId: string, status: string) => 
        fetchAPI(`/promotions/coupons/${couponId}/status`, {
          method: 'PUT',
          body: JSON.stringify({ status })
        }),
      delete: (couponId: string) => 
        fetchAPI(`/promotions/coupons/${couponId}`, {
          method: 'DELETE'
        })
    },
    scholarships: {
      list: () => fetchAPI('/promotions/scholarships'),
      apply: (scholarshipData: any) => 
        fetchAPI('/promotions/scholarships', {
          method: 'POST',
          body: JSON.stringify(scholarshipData)
        }),
      updateStatus: (scholarshipId: string, status: string) => 
        fetchAPI(`/promotions/scholarships/${scholarshipId}/status`, {
          method: 'PUT',
          body: JSON.stringify({ status })
        })
    }
  },
  audit: {
    logs: {
      list: () => fetchAPI('/audit/logs'),
      create: (logData: any) => 
        fetchAPI('/audit/logs', {
          method: 'POST',
          body: JSON.stringify(logData)
        })
    },
    roles: {
      list: () => fetchAPI('/audit/roles'),
      create: (roleData: any) => 
        fetchAPI('/audit/roles', {
          method: 'POST',
          body: JSON.stringify(roleData)
        }),
      updatePermissions: (roleId: string, permissions: string[]) => 
        fetchAPI(`/audit/roles/${roleId}/permissions`, {
          method: 'PUT',
          body: JSON.stringify({ permissions })
        }),
      delete: (roleId: string) => 
        fetchAPI(`/audit/roles/${roleId}`, {
          method: 'DELETE'
        })
    }
  },
  upload: {
    video: (file: File) => {
      const formData = new FormData();
      formData.append('video', file);
      return fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData
      }).then(async (res) => {
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || `HTTP error ${res.status}`);
        }
        return res.json();
      });
    },
    audio: (file: File) => {
      const formData = new FormData();
      formData.append('audio', file);
      return fetch(`${API_BASE_URL}/upload/audio`, {
        method: 'POST',
        body: formData
      }).then(async (res) => {
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || `HTTP error ${res.status}`);
        }
        return res.json();
      });
    }
  }
};
