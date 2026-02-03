'use client';

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  getAuth, 
  onAuthStateChanged,
  signOut
} from "firebase/auth";
import { 
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  updateDoc,
  arrayUnion,
  where,
  getDocs,
  getDoc
} from "firebase/firestore";
import { initializeApp, getApps } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyD_htQZ1TClnXKZGRJ4izbMQ02y6V3aNAQ",
  authDomain: "wawa44-58d1e.firebaseapp.com",
  databaseURL: "https://wawa44-58d1e-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "wawa44-58d1e",
  storageBucket: "wawa44-58d1e.firebasestorage.app",
  messagingSenderId: "836899520599",
  appId: "1:836899520599:web:b346e4370ecfa9bb89e312",
  measurementId: "G-8LMP7F4BE9"
};

interface Group {
  id?: string;
  name: string;
  ownerId: string;
  ownerName: string;
  members: string[];
  memberNames?: {[key: string]: string};
  createdAt: any;
}

interface Message {
  id?: string;
  text: string;
  userId: string;
  userName: string;
  groupId: string;
  type: 'text' | 'link';
  link?: string;
  thumbnail?: string;
  title?: string;
  createdAt: any;
}

export default function GroupsPage(): React.JSX.Element {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [userDisplayName, setUserDisplayName] = useState("");
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [newLink, setNewLink] = useState("");
  const [linkTitle, setLinkTitle] = useState("");
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [showNewGroupForm, setShowNewGroupForm] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [auth, setAuth] = useState<any>(null);
  const [db, setDb] = useState<any>(null);
  const [groupMembers, setGroupMembers] = useState<{[key: string]: string}>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      let app;
      if (getApps().length === 0) {
        app = initializeApp(firebaseConfig);
      } else {
        app = getApps()[0];
      }
      
      const authInstance = getAuth(app);
      const dbInstance = getFirestore(app);
      
      setAuth(authInstance);
      setDb(dbInstance);
      
    } catch (error) {
      console.error('Firebase initialization error:', error);
    }
  }, []);

  useEffect(() => {
    if (!auth) return;

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const name = currentUser.displayName || 
                    currentUser.email?.split('@')[0] || 
                    'User';
        setUserDisplayName(name);
        loadUserGroups(currentUser.uid);
      } else {
        router.push('/');
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [auth, router]);

  const loadUserGroups = async (userId: string) => {
    if (!db) return;

    try {
      const groupsRef = collection(db, 'groups');
      const q = query(groupsRef, where('members', 'array-contains', userId));
      
      const unsubscribe = onSnapshot(q, async (querySnapshot) => {
        const groupsData: Group[] = [];
        for (const docSnap of querySnapshot.docs) {
          const groupData = docSnap.data() as Group;
          
          // Ambil nama member dari users collection jika tidak ada di memberNames
          if (!groupData.memberNames || Object.keys(groupData.memberNames).length === 0) {
            groupData.memberNames = {};
            for (const memberId of groupData.members) {
              try {
                const userRef = doc(db, 'users', memberId);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                  groupData.memberNames![memberId] = userSnap.data().name || 'Unknown User';
                } else {
                  groupData.memberNames![memberId] = 'Unknown User';
                }
              } catch (error) {
                console.error("Error loading member name:", error);
                groupData.memberNames![memberId] = 'Unknown User';
              }
            }
          }
          
          groupsData.push({
            id: docSnap.id,
            ...groupData
          });
        }
        setGroups(groupsData);
        setIsLoading(false);
        
        if (groupsData.length > 0 && !selectedGroup) {
          setSelectedGroup(groupsData[0]);
        }
      });

      return unsubscribe;
    } catch (error) {
      console.error("Error loading groups:", error);
      setIsLoading(false);
    }
  };

  const loadGroupMessages = (groupId: string) => {
    if (!db) return;

    const messagesRef = collection(db, 'groupMessages');
    const q = query(
      messagesRef, 
      where('groupId', '==', groupId),
      orderBy('createdAt', 'asc')
    );
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const messagesData: Message[] = [];
      querySnapshot.forEach((doc) => {
        messagesData.push({
          id: doc.id,
          ...doc.data() as Message
        });
      });
      setMessages(messagesData);
      
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    });

    return unsubscribe;
  };

  useEffect(() => {
    if (selectedGroup && db) {
      loadGroupMessages(selectedGroup.id!);
      // Update group members when selected group changes
      if (selectedGroup.memberNames) {
        setGroupMembers(selectedGroup.memberNames);
      } else {
        // Load member names from users collection
        loadMemberNames(selectedGroup.members);
      }
    }
  }, [selectedGroup, db]);

  const loadMemberNames = async (memberIds: string[]) => {
    if (!db) return;
    
    const memberNames: {[key: string]: string} = {};
    
    for (const memberId of memberIds) {
      try {
        const userRef = doc(db, 'users', memberId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          memberNames[memberId] = userSnap.data().name || 'Unknown User';
        } else {
          memberNames[memberId] = 'Unknown User';
        }
      } catch (error) {
        console.error("Error loading member name:", error);
        memberNames[memberId] = 'Unknown User';
      }
    }
    
    setGroupMembers(memberNames);
    
    // Update group in state with member names
    if (selectedGroup) {
      setSelectedGroup({
        ...selectedGroup,
        memberNames: memberNames
      });
      
      // Update groups list
      setGroups(prevGroups => 
        prevGroups.map(group => 
          group.id === selectedGroup.id 
            ? { ...group, memberNames: memberNames }
            : group
        )
      );
    }
  };

  const handleCreateGroup = async () => {
    if (!user || !db || !newGroupName.trim()) {
      alert("Nama grup harus diisi");
      return;
    }

    try {
      const groupData = {
        name: newGroupName.trim(),
        ownerId: user.uid,
        ownerName: userDisplayName,
        members: [user.uid],
        memberNames: {
          [user.uid]: userDisplayName
        },
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'groups'), groupData);
      
      setNewGroupName("");
      setShowNewGroupForm(false);
      
      alert("Grup berhasil dibuat!");
      
    } catch (error) {
      console.error("Error creating group:", error);
      alert("Gagal membuat grup. Silakan coba lagi.");
    }
  };

  const handleSendMessage = async () => {
    if (!user || !db || !selectedGroup || !newMessage.trim()) return;

    try {
      const messageData = {
        text: newMessage.trim(),
        userId: user.uid,
        userName: userDisplayName,
        groupId: selectedGroup.id,
        type: 'text',
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'groupMessages'), messageData);
      setNewMessage("");
      
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Gagal mengirim pesan.");
    }
  };

  const handleSendLink = async () => {
    if (!user || !db || !selectedGroup || !newLink.trim()) {
      alert("Link harus diisi");
      return;
    }

    try {
      const thumbnail = generateThumbnail(newLink.trim());

      const messageData = {
        text: linkTitle || "Link yang dibagikan",
        userId: user.uid,
        userName: userDisplayName,
        groupId: selectedGroup.id,
        type: 'link',
        link: newLink.trim(),
        thumbnail: thumbnail,
        title: linkTitle || "Link yang dibagikan",
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'groupMessages'), messageData);
      
      setNewLink("");
      setLinkTitle("");
      setShowLinkForm(false);
      
    } catch (error) {
      console.error("Error sending link:", error);
      alert("Gagal mengirim link.");
    }
  };

  const generateThumbnail = (link: string): string => {
    if (!link) return "";
    
    try {
      const url = new URL(link);
      
      if (url.hostname.includes('youtube.com') || url.hostname.includes('youtu.be')) {
        const videoId = url.searchParams.get('v') || url.pathname.split('/').pop();
        if (videoId) {
          return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        }
      }
      
      if (url.hostname.includes('vimeo.com')) {
        const videoId = url.pathname.split('/').pop();
        if (videoId) {
          return `https://i.vimeocdn.com/video/${videoId}_640.jpg`;
        }
      }
      
      return "";
    } catch {
      return "";
    }
  };

  const getVideoEmbedUrl = (link: string) => {
    if (!link) return null;
    
    try {
      const url = new URL(link);
      
      if (url.hostname.includes('youtube.com') || url.hostname.includes('youtu.be')) {
        const videoId = url.searchParams.get('v') || url.pathname.split('/').pop();
        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&showinfo=0`;
        }
      }
      
      if (url.hostname.includes('vimeo.com')) {
        const videoId = url.pathname.split('/').pop();
        if (videoId) {
          return `https://player.vimeo.com/video/${videoId}?autoplay=0&title=0&byline=0&portrait=0`;
        }
      }
      
      return null;
    } catch {
      return null;
    }
  };

  const handleLogout = async () => {
    if (auth) {
      try {
        await signOut(auth);
        router.push('/');
      } catch (error) {
        console.error("Error logging out:", error);
      }
    }
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return "";
    
    const date = timestamp.toDate();
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "";
    
    const date = timestamp.toDate();
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return "Hari ini";
    } else if (diffDays === 1) {
      return "Kemarin";
    }
    
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short'
    });
  };

  // Fungsi untuk menampilkan daftar member
  const showMemberList = () => {
    if (!selectedGroup) return;
    
    const memberList = selectedGroup.members.map(memberId => {
      const memberName = groupMembers[memberId] || selectedGroup.memberNames?.[memberId] || 'Unknown User';
      return `${memberName}${memberId === selectedGroup.ownerId ? ' (Owner)' : ''}`;
    }).join('\n');
    
    alert(`Anggota Grup "${selectedGroup.name}":\n\n${memberList}`);
  };

  if (!auth || !db) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'black',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontFamily: 'Helvetica, Arial, sans-serif',
        fontSize: '20px'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'black',
      margin: 0,
      padding: 0,
      width: '100%',
      fontFamily: 'Helvetica, Arial, sans-serif',
      color: 'white',
      position: 'relative'
    }}>
      {/* Header */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        padding: '20px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'black',
        zIndex: 100,
      }}>
        {/* Judul Website */}
        <div style={{
          fontSize: '42px',
          fontFamily: 'Helvetica, Arial, sans-serif',
          fontWeight: 'bold',
          color: 'white',
          letterSpacing: '1px',
          cursor: 'pointer'
        }} onClick={() => router.push('/')}>
          Menuru
        </div>

        {/* Nama User dan Tombol */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '30px'
        }}>
          {/* Nama User dengan South East Arrow */}
          <div style={{
            fontSize: '32px',
            fontFamily: 'Helvetica, Arial, sans-serif',
            color: 'white',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            {userDisplayName}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 17l9.2-9.2M17 17V7H7"/>
            </svg>
          </div>
          
          {/* Tombol Kembali ke Notes */}
          <button
            onClick={() => router.push('/notes')}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: 'white',
              padding: '10px',
              cursor: 'pointer',
              fontSize: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
            title="Kembali ke Catatan"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Notes
          </button>

          {/* Tombol Buat Grup Baru */}
          <button
            onClick={() => setShowNewGroupForm(true)}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: 'white',
              padding: '10px',
              cursor: 'pointer',
              fontSize: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Buat Grup Baru"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          </button>

          {/* Tombol Logout */}
          <button
            onClick={handleLogout}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: 'white',
              padding: '10px',
              cursor: 'pointer',
              fontSize: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Logout"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '160px 20px 100px',
        boxSizing: 'border-box',
        display: 'flex',
        gap: '40px'
      }}>
        {/* Sidebar Grup */}
        <div style={{
          width: '300px',
          flexShrink: 0
        }}>
          <div style={{
            fontSize: '36px',
            fontWeight: 'bold',
            marginBottom: '40px'
          }}>
            Grup Anda
          </div>
          
          {isLoading ? (
            <div style={{
              fontSize: '20px',
              color: '#aaa'
            }}>
              Memuat grup...
            </div>
          ) : groups.length === 0 ? (
            <div style={{
              fontSize: '24px',
              color: '#888'
            }}>
              Belum ada grup
            </div>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '15px'
            }}>
              {groups.map((group) => (
                <div
                  key={group.id}
                  onClick={() => setSelectedGroup(group)}
                  style={{
                    padding: '20px',
                    backgroundColor: selectedGroup?.id === group.id ? '#222' : 'transparent',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    border: selectedGroup?.id === group.id ? '1px solid #444' : '1px solid transparent',
                    transition: 'all 0.3s'
                  }}
                >
                  <div style={{
                    fontSize: '28px',
                    fontWeight: 'bold',
                    marginBottom: '10px'
                  }}>
                    {group.name}
                  </div>
                  <div style={{
                    fontSize: '18px',
                    color: '#aaa'
                  }}>
                    {group.members?.length || 0} anggota
                  </div>
                  <div style={{
                    fontSize: '16px',
                    color: '#666',
                    marginTop: '5px'
                  }}>
                    Dibuat {formatDate(group.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Area Chat */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column'
        }}>
          {!selectedGroup ? (
            <div style={{
              textAlign: 'center',
              padding: '100px 20px',
              fontSize: '28px',
              color: '#888'
            }}>
              Pilih grup untuk memulai percakapan
            </div>
          ) : (
            <>
              {/* Header Chat */}
              <div style={{
                paddingBottom: '30px',
                marginBottom: '30px',
                borderBottom: '1px solid #333'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '20px'
                }}>
                  <div style={{
                    fontSize: '48px',
                    fontWeight: 'bold'
                  }}>
                    {selectedGroup.name}
                  </div>
                  <button
                    onClick={showMemberList}
                    style={{
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: 'white',
                      padding: '10px',
                      cursor: 'pointer',
                      fontSize: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                    title="Lihat Anggota Grup"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
                    </svg>
                    Anggota
                  </button>
                </div>
                <div style={{
                  fontSize: '22px',
                  color: '#aaa',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px'
                }}>
                  <span>
                    {selectedGroup.members?.length || 0} anggota
                  </span>
                  <span>•</span>
                  <span>
                    Pemilik: {selectedGroup.ownerName}
                  </span>
                </div>
              </div>

              {/* Daftar Pesan */}
              <div style={{
                flex: 1,
                overflowY: 'auto',
                maxHeight: '500px',
                padding: '20px',
                backgroundColor: '#111',
                borderRadius: '12px',
                marginBottom: '30px',
                display: 'flex',
                flexDirection: 'column',
                gap: '25px'
              }}>
                {messages.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '50px',
                    fontSize: '24px',
                    color: '#888'
                  }}>
                    Belum ada pesan di grup ini
                  </div>
                ) : (
                  messages.map((message) => {
                    const videoEmbedUrl = getVideoEmbedUrl(message.link || "");
                    
                    return (
                      <div
                        key={message.id}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: message.userId === user?.uid ? 'flex-end' : 'flex-start'
                        }}
                      >
                        {message.userId !== user?.uid && (
                          <div style={{
                            fontSize: '18px',
                            color: '#aaa',
                            marginBottom: '5px',
                            alignSelf: 'flex-start'
                          }}>
                            {message.userName}
                          </div>
                        )}

                        <div style={{
                          backgroundColor: message.userId === user?.uid ? '#007bff' : '#333',
                          padding: message.type === 'link' ? '0' : '20px',
                          borderRadius: '15px',
                          borderTopLeftRadius: message.userId === user?.uid ? '15px' : '5px',
                          borderTopRightRadius: message.userId === user?.uid ? '5px' : '15px',
                          maxWidth: '80%'
                        }}>
                          {message.type === 'text' && (
                            <div style={{
                              fontSize: '22px',
                              whiteSpace: 'pre-wrap',
                              wordBreak: 'break-word'
                            }}>
                              {message.text}
                            </div>
                          )}
                          
                          {message.type === 'link' && (
                            <div style={{
                              display: 'flex',
                              flexDirection: 'column'
                            }}>
                              <a
                                href={message.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  textDecoration: 'none',
                                  color: 'white',
                                  display: 'block'
                                }}
                              >
                                <div style={{
                                  padding: '20px',
                                  borderBottom: message.thumbnail ? '1px solid rgba(255,255,255,0.1)' : 'none'
                                }}>
                                  <div style={{
                                    fontSize: '22px',
                                    fontWeight: 'bold',
                                    marginBottom: '10px'
                                  }}>
                                    {message.title}
                                  </div>
                                  <div style={{
                                    fontSize: '18px',
                                    color: '#ccc',
                                    wordBreak: 'break-all'
                                  }}>
                                    {message.link}
                                  </div>
                                </div>
                                {message.thumbnail && (
                                  <div>
                                    <img 
                                      src={message.thumbnail} 
                                      alt="Thumbnail"
                                      style={{
                                        width: '100%',
                                        height: 'auto',
                                        borderBottomLeftRadius: '15px',
                                        borderBottomRightRadius: '15px'
                                      }}
                                    />
                                  </div>
                                )}
                              </a>
                            </div>
                          )}
                          
                          {videoEmbedUrl && message.type === 'link' && (
                            <div style={{
                              marginTop: '15px',
                              padding: '0 20px 20px'
                            }}>
                              <div style={{
                                position: 'relative',
                                paddingBottom: '56.25%',
                                height: 0,
                                overflow: 'hidden',
                                backgroundColor: '#000',
                                borderRadius: '8px'
                              }}>
                                <iframe
                                  src={videoEmbedUrl}
                                  style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    border: 'none'
                                  }}
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        <div style={{
                          fontSize: '16px',
                          color: '#888',
                          marginTop: '8px',
                          alignSelf: message.userId === user?.uid ? 'flex-end' : 'flex-start'
                        }}>
                          {formatTime(message.createdAt)}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Form Kirim Pesan */}
              <div style={{
                backgroundColor: '#111',
                borderRadius: '12px',
                padding: '20px'
              }}>
                {showLinkForm ? (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '15px'
                  }}>
                    <input
                      type="text"
                      value={newLink}
                      onChange={(e) => setNewLink(e.target.value)}
                      placeholder="Masukkan link (YouTube, Vimeo, artikel, dll.)"
                      style={{
                        width: '100%',
                        padding: '15px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: 'white',
                        fontSize: '20px',
                        outline: 'none'
                      }}
                    />
                    <input
                      type="text"
                      value={linkTitle}
                      onChange={(e) => setLinkTitle(e.target.value)}
                      placeholder="Judul link (opsional)"
                      style={{
                        width: '100%',
                        padding: '15px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: 'white',
                        fontSize: '20px',
                        outline: 'none'
                      }}
                    />
                    <div style={{
                      display: 'flex',
                      gap: '10px'
                    }}>
                      <button
                        onClick={() => {
                          setShowLinkForm(false);
                          setNewLink("");
                          setLinkTitle("");
                        }}
                        style={{
                          flex: 1,
                          padding: '15px',
                          backgroundColor: 'transparent',
                          border: 'none',
                          color: 'white',
                          fontSize: '20px',
                          cursor: 'pointer'
                        }}
                      >
                        Batal
                      </button>
                      <button
                        onClick={handleSendLink}
                        style={{
                          flex: 1,
                          padding: '15px',
                          backgroundColor: 'transparent',
                          border: 'none',
                          color: 'white',
                          fontSize: '20px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '10px'
                        }}
                      >
                        Kirim Link
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{
                    display: 'flex',
                    gap: '10px'
                  }}>
                    <button
                      onClick={() => setShowLinkForm(true)}
                      style={{
                        padding: '15px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: 'white',
                        fontSize: '24px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title="Kirim Link dengan Thumbnail"
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
                        <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
                      </svg>
                    </button>
                    
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Ketik pesan..."
                      style={{
                        flex: 1,
                        padding: '15px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: 'white',
                        fontSize: '22px',
                        outline: 'none'
                      }}
                    />
                    
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      style={{
                        padding: '15px 30px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: newMessage.trim() ? 'white' : '#666',
                        fontSize: '22px',
                        cursor: newMessage.trim() ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                      }}
                    >
                      Kirim
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal buat grup baru */}
      {showNewGroupForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.95)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1001,
          padding: '30px',
          fontFamily: 'Helvetica, Arial, sans-serif'
        }}>
          <div style={{
            backgroundColor: 'black',
            width: '100%',
            maxWidth: '500px',
            padding: '50px',
            fontFamily: 'Helvetica, Arial, sans-serif',
          }}>
            <div style={{
              marginBottom: '40px',
              fontFamily: 'Helvetica, Arial, sans-serif'
            }}>
              <div style={{
                fontSize: '32px',
                fontFamily: 'Helvetica, Arial, sans-serif',
                marginBottom: '20px',
                color: 'white',
                fontWeight: 'bold'
              }}>
                Buat Grup Baru
              </div>
              <div style={{
                fontSize: '20px',
                color: 'white'
              }}>
                Buat grup untuk berbagi catatan dengan teman-teman
              </div>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '25px'
            }}>
              <input
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Nama Grup"
                style={{
                  width: '100%',
                  padding: '20px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: 'white',
                  fontSize: '24px',
                  outline: 'none'
                }}
              />

              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '20px',
                marginTop: '30px'
              }}>
                <button
                  onClick={() => {
                    setShowNewGroupForm(false);
                    setNewGroupName("");
                  }}
                  style={{
                    padding: '15px 30px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: 'white',
                    fontSize: '20px',
                    cursor: 'pointer'
                  }}
                >
                  Batal
                </button>
                <button
                  onClick={handleCreateGroup}
                  style={{
                    padding: '15px 30px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: 'white',
                    fontSize: '20px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                >
                  Buat Grup
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5v14M5 12h14"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
