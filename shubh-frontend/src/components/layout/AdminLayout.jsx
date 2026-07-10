import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { useState } from 'react';

const NAV_GROUPS = [
  {
    label: 'Content',
    links: [
      { to: '/admin', label: 'Dashboard', end: true },
      { to: '/admin/posts', label: 'Posts', end: false },
      { to: '/admin/projects', label: 'Projects', end: false },
    ],
  },
  {
    label: 'Audience',
    links: [
      { to: '/admin/comments', label: 'Comments', end: false },
      { to: '/admin/messages', label: 'Messages', end: false },
    ],
  },
  {
    label: 'System',
    links: [
      { to: '/admin/settings', label: 'Settings', end: false },
    ],
  },
];


export default function AdminLayout() {

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);


  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully.');
    navigate('/login', { replace:true });
  };


  return (

    <div className="
      min-h-screen 
      bg-bg 
      flex
      overflow-hidden
    ">


      {/* Mobile overlay */}
      {mobileOpen && (

        <div
          onClick={() => setMobileOpen(false)}
          className="
            fixed
            inset-0
            bg-black/40
            z-40
            lg:hidden
          "
        />

      )}



      {/* Sidebar */}

      <aside

        className={`
          fixed
          lg:static
          inset-y-0
          left-0
          z-50

          w-64
          shrink-0

          border-r

          flex
          flex-col

          bg-bg

          transform
          transition-transform
          duration-300

          ${mobileOpen 
            ? 'translate-x-0'
            : '-translate-x-full lg:translate-x-0'
          }
        `}

        style={{
          borderColor:'var(--color-border)'
        }}

      >


        {/* Brand */}

        <div 
          className="
            px-6
            pt-8
            pb-6
            border-b
          "
          style={{
            borderColor:'var(--color-border)'
          }}
        >

          <Link
            to="/"
            className="
              font-display
              font-bold
              text-lg
            "
            style={{
              color:'var(--color-text)'
            }}
          >
            SJ<span style={{
              color:'var(--color-accent)'
            }}>.</span>

          </Link>


          <p
            className="
              font-mono
              text-[10px]
              tracking-widest
              uppercase
              mt-1
            "
            style={{
              color:'var(--color-faint)'
            }}
          >
            Admin Panel
          </p>

        </div>



        {/* User */}

        {
          user && (

          <div
            className="
              px-6
              py-4
              border-b
            "
            style={{
              borderColor:'var(--color-border)'
            }}
          >

            <p
              className="
                text-sm
                font-medium
                truncate
              "
              style={{
                color:'var(--color-text)'
              }}
            >
              {user.name}

            </p>


            <p
              className="
                font-mono
                text-[10px]
                truncate
              "
              style={{
                color:'var(--color-faint)'
              }}
            >
              {user.email}

            </p>


          </div>

        )}




        {/* Navigation */}

        <nav
          className="
            flex-1
            px-3
            py-4
            overflow-y-auto
          "
        >

          {
            NAV_GROUPS.map(({label,links})=>(

              <div
                key={label}
                className="mb-5"
              >

                <p
                  className="
                    font-mono
                    text-[9px]
                    tracking-widest
                    uppercase
                    px-3
                    mb-2
                  "
                  style={{
                    color:'var(--color-faint)'
                  }}
                >
                  {label}
                </p>


                <ul>

                {
                  links.map(({to,label:lbl,end})=>(

                    <li key={to}>

                      <NavLink

                        to={to}

                        end={end}

                        onClick={() => setMobileOpen(false)}

                        className={({isActive})=>`

                          block
                          px-3
                          py-2.5
                          text-sm
                          transition-colors

                          ${
                            isActive
                            ? 'border-l-2 pl-[10px]'
                            : 'hover:bg-card'
                          }

                        `}

                        style={({isActive})=>({

                          color:isActive
                          ? 'var(--color-text)'
                          :'var(--color-muted)',


                          borderLeftColor:isActive
                          ? 'var(--color-accent)'
                          :'transparent',


                          backgroundColor:isActive
                          ? 'var(--color-card)'
                          :undefined

                        })}

                      >

                        {lbl}

                      </NavLink>


                    </li>

                  ))
                }

                </ul>


              </div>


            ))
          }


        </nav>



        {/* Bottom */}

        <div
          className="
            px-6
            py-5
            border-t
            space-y-3
          "
          style={{
            borderColor:'var(--color-border)'
          }}
        >

          <Link
            to="/"
            className="
              block
              font-mono
              text-xs
            "
            style={{
              color:'var(--color-faint)'
            }}
          >
            ← Public site
          </Link>


          <button
            onClick={handleLogout}
            className="
              font-mono
              text-xs
              text-left
            "
            style={{
              color:'var(--color-faint)'
            }}
          >
            Logout
          </button>


        </div>


      </aside>



      {/* Main */}

      <main

        className="
          flex-1
          min-w-0
          overflow-auto
          min-h-screen
        "

        style={{
          backgroundColor:'var(--color-bg)',
          color:'var(--color-text)'
        }}

      >

        <Outlet 
          context={{
            openSidebar:()=>setMobileOpen(true)
          }}
        />


      </main>


    </div>

  );

}