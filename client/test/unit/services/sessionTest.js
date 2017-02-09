describe('session', function() {

  var session;

  beforeEach(module('tutorExchange'));

  beforeEach(inject(function(_session_) {
    session = _session_;
  }));


  var sampleUsers = [
    {id: 11223344, name: 'Joe Bloggs', role: 'Student'},
    {id: 11223345, name: 'Jill Bloggs', role: 'Tutor'},
  ];

  it('all getters return null when session has not been created', function() {
    expect(session.exists()).toBe(false);
    expect(session.getUserId()).toBeNull();
    expect(session.getUserName()).toBeNull();
    expect(session.getUserRole()).toBeNull();
  });

  it('should be able to create new session', function() {
    var sampleUser = sampleUsers[0];

    expect(session.exists()).toBe(false);
    session.create(sampleUser.id, sampleUser.name, sampleUser.role);

    expect(session.exists()).toBe(true);
    expect(session.getUserId()).toBe(sampleUser.id);
    expect(session.getUserName()).toBe(sampleUser.name);
    expect(session.getUserRole()).toBe(sampleUser.role);
  });

  it('should be able to delete sessions', function() {
    var sampleUser = sampleUsers[0];

    expect(session.exists()).toBe(false);
    session.create(sampleUser.id, sampleUser.name, sampleUser.role);

    expect(session.exists()).toBe(true);
    session.destroy();

    expect(session.exists()).toBe(false);
    expect(session.getUserId()).toBeNull();
    expect(session.getUserName()).toBeNull();
    expect(session.getUserRole()).toBeNull();
  });

  it('should overwrite old session if a new session is created', function() {
    session.create(sampleUsers[0].id, sampleUsers[0].name, sampleUsers[0].role);
    session.create(sampleUsers[1].id, sampleUsers[1].name, sampleUsers[1].role);

    expect(session.exists()).toBe(true);
    expect(session.getUserId()).toBe(sampleUsers[1].id);
    expect(session.getUserName()).toBe(sampleUsers[1].name);
    expect(session.getUserRole()).toBe(sampleUsers[1].role);
  });

});